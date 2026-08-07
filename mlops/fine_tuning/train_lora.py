import os
import torch
from datasets import load_dataset
# from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TrainingArguments
# from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
# from trl import SFTTrainer

# PRERNA AI MLOps - Stage 2 QLoRA Fine-Tuning Pipeline

def main():
    print("Initializing PRERNA QLoRA Fine-Tuning...")
    
    # Configuration
    model_id = "meta-llama/Meta-Llama-3-8B-Instruct" # Change to Qwen2.5 or Mistral as needed
    dataset_path = "../data/prerna_synthetic_dataset.jsonl"
    output_dir = "./prerna-lora-adapter"
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Please run dataset_generation first.")
        return
        
    print(f"Dataset located. Preparing to load into memory.")
    
    print(f"Loading base model {model_id} in 4-bit...")
    # NOTE: The following blocks are commented out so this script doesn't crash 
    # if run on a machine without a dedicated NVIDIA GPU and CUDA installed.
    # When you move this to a RunPod or Colab A100 instance, simply uncomment them!

    """
    # 1. Load Dataset
    dataset = load_dataset("json", data_files=dataset_path, split="train")
    
    def formatting_prompts_func(example):
        output_texts = []
        for i in range(len(example['instruction'])):
            text = f"User: {example['instruction'][i]}\nAssistant: {example['response'][i]}"
            output_texts.append(text)
        return output_texts

    # 2. 4-bit Quantization Config (QLoRA)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16
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
    
    # 4. LoRA Configuration
    peft_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)
    
    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        optim="paged_adamw_32bit",
        save_steps=50,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=False,
        bf16=True,
        max_grad_norm=0.3,
        max_steps=200,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="cosine",
        report_to="wandb" # Integrate with Weights & Biases
    )
    
    # 6. Start Training
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        formatting_func=formatting_prompts_func,
        args=training_args
    )
    
    trainer.train()
    trainer.model.save_pretrained(output_dir)
    """
    
    print("Pipeline scaffold ready.")
    print("To execute for real, uncomment the HuggingFace blocks and run on a GPU instance.")
    print("After training, export using llama.cpp convert script to create prerna-custom.gguf.")

if __name__ == "__main__":
    main()
