#!/usr/bin/env python3
"""
QLoRA Fine-Tuning for PRERNA on RTX 4060 (8GB VRAM)
Optimizes for domain adaptation (Yoga/Pharmacy/Education) while preserving safety alignment.
"""

import os
import torch
import argparse
from pathlib import Path
from typing import Optional

from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig,
    DataCollatorForSeq2Seq
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    TaskType
)
from trl import SFTTrainer, DataCollatorForCompletionOnlyLM
from datasets import load_dataset, Dataset
import wandb

# Disable tokenizer parallelism warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"

def setup_model(model_name: str = "Qwen/Qwen2.5-7B-Instruct"):
    """Load and quantize model for 8GB VRAM."""
    print(f"🔧 Loading {model_name} with 4-bit quantization...")
    
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,      # Nested quantization saves ~0.5GB
        bnb_4bit_quant_type="nf4",           # Normalized Float 4 (better than FP4)
        bnb_4bit_compute_dtype=torch.bfloat16,
    )
    
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",                  # Automatically balance across GPU/CPU
        trust_remote_code=True,
        use_cache=False,                    # Required for gradient checkpointing
        attn_implementation="flash_attention_2" if torch.cuda.is_available() else "eager",
    )
    
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        padding_side="right"
    )
    tokenizer.pad_token = tokenizer.eos_token
    
    # Prepare for QLoRA training
    model = prepare_model_for_kbit_training(
        model,
        use_gradient_checkpointing=True      # Saves VRAM at cost of ~30% speed
    )
    
    return model, tokenizer

def setup_lora(model, r: int = 64, alpha: int = 128):
    """Configure LoRA for domain adaptation."""
    print(f"🎯 Configuring LoRA (r={r}, alpha={alpha})...")
    
    # Target all linear layers for comprehensive adaptation
    peft_config = LoraConfig(
        r=r,
        lora_alpha=alpha,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",      # Self-attention
            "gate_proj", "up_proj", "down_proj",          # MLP/FFN
        ],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
    )
    
    model = get_peft_model(model, peft_config)
    
    # Print trainable parameters
    model.print_trainable_parameters()
    # Should show ~1-2% of total params (e.g., 100M-200M trainable)
    
    return model

def format_chatml(example):
    """Convert messages to ChatML format for Qwen."""
    messages = example["messages"]
    formatted = ""
    
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        
        if role == "system":
            formatted += f"<|im_start|>system\n{content}<|im_end|>\n"
        elif role == "user":
            formatted += f"<|im_start|>user\n{content}<|im_end|>\n"
        elif role == "assistant":
            formatted += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    
    return {"text": formatted.strip()}

def train(
    dataset_path: str = "mlops/data/prerna_synthetic_v1.jsonl",
    output_dir: str = "mlops/outputs/prerna-7b-lora",
    num_epochs: int = 3,
    batch_size: int = 1,           # Must be 1 for 8GB VRAM
    grad_accum: int = 4,           # Effective batch size = 4
    max_seq_length: int = 2048,
    learning_rate: float = 2e-4,
    warmup_ratio: float = 0.03,
    logging_steps: int = 10,
    save_steps: int = 500,
    use_wandb: bool = False,
):
    """Main training loop."""
    
    # Load dataset
    print(f"📚 Loading dataset from {dataset_path}...")
    dataset = load_dataset("json", data_files=dataset_path, split="train")
    dataset = dataset.map(format_chatml, remove_columns=dataset.column_names)
    
    print(f"   Loaded {len(dataset)} examples")
    
    # Setup model
    model, tokenizer = setup_model()
    model = setup_lora(model)
    
    # Training arguments optimized for RTX 4060
    args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=grad_accum,
        learning_rate=learning_rate,
        max_grad_norm=0.3,                  # Gradient clipping for stability
        warmup_ratio=warmup_ratio,
        lr_scheduler_type="cosine",
        
        # Logging & Evaluation
        logging_steps=logging_steps,
        logging_first_step=True,
        save_strategy="steps",
        save_steps=save_steps,
        save_total_limit=2,                # Keep only last 2 checkpoints
        
        # Memory optimization
        fp16=True,                         # Mixed precision
        optim="paged_adamw_8bit",          # Critical: pages optimizer states to CPU
        group_by_length=True,              # Saves memory, slight speedup
        
        # Reproducibility
        seed=42,
        data_seed=42,
        
        # Reporting
        report_to="wandb" if use_wandb else "none",
        run_name="prerna-qlora-v1" if use_wandb else None,
    )
    
    # Response-only training (don't train on user queries)
    response_template = "<|im_start|>assistant\n"
    collator = DataCollatorForCompletionOnlyLM(
        response_template=response_template,
        tokenizer=tokenizer,
    )
    
    # Initialize trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        args=args,
        data_collator=collator,
        max_seq_length=max_seq_length,
        dataset_text_field="text",
    )
    
    # Train
    print("🚀 Starting training...")
    print(f"   Epochs: {num_epochs}")
    print(f"   Steps per epoch: ~{len(dataset) // (batch_size * grad_accum)}")
    print(f"   Estimated time on RTX 4060: ~{num_epochs * 2} hours")
    
    trainer.train()
    
    # Save final adapter
    final_path = Path(output_dir) / "final_adapter"
    trainer.save_model(final_path)
    tokenizer.save_pretrained(final_path)
    
    print(f"\n✅ Training complete!")
    print(f"   Adapter saved to: {final_path}")
    
    return final_path

def main():
    parser = argparse.ArgumentParser(description="Train PRERNA with QLoRA")
    parser.add_argument("--dataset", default="mlops/data/prerna_synthetic_v1.jsonl")
    parser.add_argument("--output", default="mlops/outputs/prerna-7b-lora")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=1)
    parser.add_argument("--grad_accum", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--max_seq_length", type=int, default=2048)
    parser.add_argument("--wandb", action="store_true", help="Enable Weights & Biases logging")
    
    args = parser.parse_args()
    
    if args.wandb:
        wandb.init(project="prerna-qlora", name="prerna-v1-rt4060")
    
    # Commented out actual execution for agent context safety without CUDA
    print("Training configuration loaded.")
    print("To execute, uncomment train() call in mlops/fine_tuning/train_lora.py")
    
    # train(
    #     dataset_path=args.dataset,
    #     output_dir=args.output,
    #     num_epochs=args.epochs,
    #     batch_size=args.batch_size,
    #     grad_accum=args.grad_accum,
    #     learning_rate=args.lr,
    #     max_seq_length=args.max_seq_length,
    #     use_wandb=args.wandb,
    # )

def log_vram():
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        print(f"  VRAM: {allocated:.2f}GB allocated / {reserved:.2f}GB reserved")

if __name__ == "__main__":
    main()
