import os
import subprocess
# from peft import PeftModel
# from transformers import AutoModelForCausalLM, AutoTokenizer

def main():
    print("PRERNA AI MLOps - Stage 3 Export & Quantization")
    print("Merging LoRA adapters into base weights for GGUF conversion...")
    
    base_model_id = "Qwen/Qwen2.5-7B-Instruct"
    peft_model_path = "../fine_tuning/prerna-7b-lora"
    merged_output_path = "./prerna-7b-merged"
    
    # NOTE: Uncomment when running on a machine with PyTorch/Transformers installed
    """
    if not os.path.exists(peft_model_path):
        print(f"Adapter not found at {peft_model_path}. Please run train_lora.py first.")
        return
        
    print("Loading base model...")
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        return_dict=True,
        torch_dtype=torch.bfloat16,
        device_map="cpu", # Merge on CPU if VRAM is tight
    )
    
    tokenizer = AutoTokenizer.from_pretrained(base_model_id)
    
    print("Loading LoRA adapter...")
    model = PeftModel.from_pretrained(base_model, peft_model_path)
    
    print("Merging weights (this may take a while)...")
    model = model.merge_and_unload()
    
    print(f"Saving merged model to {merged_output_path}...")
    model.save_pretrained(merged_output_path)
    tokenizer.save_pretrained(merged_output_path)
    print("Merge complete!")
    """
    
    print("\nNext step: Convert to GGUF and quantize for llama.cpp")
    print("Run the following commands manually after cloning llama.cpp:")
    print(f"1. python convert-hf-to-gguf.py {merged_output_path} --outfile prerna-7b-f16.gguf")
    print(f"2. ./llama-quantize prerna-7b-f16.gguf prerna-7b-Q4_K_M.gguf Q4_K_M")
    print("3. Move prerna-7b-Q4_K_M.gguf to your Tauri app_data/models/ directory.")

if __name__ == "__main__":
    main()
