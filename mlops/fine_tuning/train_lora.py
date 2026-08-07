import os
import torch
from datasets import load_dataset
# from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
# from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, BitsAndBytesConfig
# from trl import SFTTrainer

# PRERNA AI MLOps - Stage 3 QLoRA Fine-Tuning Pipeline
# Optimized for RTX 4060 (8GB VRAM)

def main():
    print("Initializing PRERNA QLoRA Fine-Tuning for RTX 4060...")
    
    # Configuration
    model_id = "Qwen/Qwen2.5-7B-Instruct" 
    dataset_path = "../data/prerna_synthetic_dataset.jsonl"
    output_dir = "./prerna-7b-lora"
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Please run dataset_generation first.")
        return
        
    print(f"Dataset located. Preparing to load into memory.")
    print(f"Loading base model {model_id} in 4-bit...")

    # NOTE: Commented out so this script doesn't crash on machines without CUDA.
    # When running on the RTX 4060 or a RunPod instance, simply uncomment.

    """
    # 1. Load Dataset
    dataset = load_dataset("json", data_files=dataset_path, split="train")
    
    def formatting_prompts_func(example):
        output_texts = []
        for msgs in example['messages']:
            # Assume ChatML formatting for Qwen/Mistral
            text = f"<|im_start|>system\n{msgs[0]['content']}<|im_end|>\n<|im_start|>user\n{msgs[1]['content']}<|im_end|>\n<|im_start|>assistant\n{msgs[2]['content']}<|im_end|>"
            output_texts.append(text)
        return output_texts

    # 2. 4-bit Quantization Config (QLoRA) for 8GB VRAM
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
    )
    
    # 3. Load Base Model and Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    model = prepare_model_for_kbit_training(model)
    
    # 4. LoRA Configuration (High rank for domain adaptation)
    peft_config = LoraConfig(
        r=64, 
        lora_alpha=128,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)
    
    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        fp16=False,
        bf16=True,
        optim="paged_adamw_8bit",  # Critical for 8GB VRAM constraints
        save_steps=100,
        logging_steps=10,
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="cosine",
        report_to="none" 
    )
    
    # 6. Start Training
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        formatting_func=formatting_prompts_func,
        max_seq_length=2048,
        args=training_args
    )
    
    trainer.train()
    trainer.model.save_pretrained(output_dir)
    """
    
    print("Pipeline scaffold ready for RTX 4060.")
    print("To execute for real, uncomment the HuggingFace blocks and run locally.")

if __name__ == "__main__":
    main()
