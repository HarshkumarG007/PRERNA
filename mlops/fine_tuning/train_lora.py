#!/usr/bin/env python3
"""
QLoRA Fine-Tuning for PRERNA on RTX 4060 (8GB VRAM)
"""

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer, DataCollatorForCompletionOnlyLM
from datasets import load_dataset
import argparse

def main(model_name: str = "Qwen/Qwen2.5-7B-Instruct", dataset_path: str = "mlops/data/prerna_synthetic_v1.jsonl"):
    # 4-bit quantization for 8GB VRAM
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,  # Nested quantization for memory
        bnb_4bit_quant_type="nf4",       # Normalized float 4 (better than FP4)
        bnb_4bit_compute_dtype=torch.bfloat16,
    )
    
    print(f"Loading {model_name}...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        use_cache=False,  # Required for gradient checkpointing
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Prepare for training
    model = prepare_model_for_kbit_training(model)
    
    # LoRA config optimized for domain adaptation
    peft_config = LoraConfig(
        r=64,                    # Higher rank for domain knowledge
        lora_alpha=128,         # 2x r is standard
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",  # Attention
            "gate_proj", "up_proj", "down_proj",    # FFN
        ],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )
    
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()  # Should show ~1-2% of params
    
    # Load dataset
    dataset = load_dataset("json", data_files=dataset_path, split="train")
    
    # Training arguments for RTX 4060
    args = TrainingArguments(
        output_dir="mlops/outputs/prerna-7b-lora",
        num_train_epochs=3,
        per_device_train_batch_size=1,      # Must be 1 for 8GB
        gradient_accumulation_steps=4,       # Effective batch size 4
        learning_rate=2e-4,
        max_grad_norm=0.3,                   # Gradient clipping for stability
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
        logging_steps=10,
        save_strategy="epoch",
        fp16=True,
        optim="paged_adamw_8bit",            # Critical: pages optimizer states to CPU
        group_by_length=True,                # Saves memory by batching similar lengths
    )
    
    # Response-only training (don't train on user queries)
    response_template = "### Response:"
    collator = DataCollatorForCompletionOnlyLM(
        response_template=response_template,
        tokenizer=tokenizer,
    )
    
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        args=args,
        data_collator=collator,
        max_seq_length=2048,
        dataset_text_field="messages",  # Adjust based on your JSONL structure
    )
    
    print("Starting training...")
    trainer.train()
    
    # Save adapter
    model.save_pretrained("mlops/outputs/prerna-7b-lora-adapter")
    print("Training complete. Adapter saved.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="Qwen/Qwen2.5-7B-Instruct")
    parser.add_argument("--dataset", default="mlops/data/prerna_synthetic_v1.jsonl")
    args = parser.parse_args()
    
    # Commenting out actual execution so it doesn't crash on machines without CUDA
    print("To train locally, uncomment the main() call in train_lora.py")
    # main(args.model, args.dataset)
