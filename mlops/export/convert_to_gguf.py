#!/usr/bin/env python3
"""
Merge LoRA adapter and convert to GGUF for llama-cpp-2
"""

import subprocess
import os
from pathlib import Path
# from peft import PeftModel
# from transformers import AutoModelForCausalLM, AutoTokenizer

def export_to_gguf(
    base_model: str = "Qwen/Qwen2.5-7B-Instruct",
    adapter_path: str = "mlops/outputs/prerna-7b-lora-adapter",
    output_name: str = "prerna-7b-q4_k_m.gguf"
):
    print("Export pipeline scaffold ready.")
    print("To execute for real, uncomment the HuggingFace blocks in convert_to_gguf.py and run on a GPU instance.")
    
    # NOTE: Commented out to prevent crash on non-CUDA machines during AI agent execution.
    """
    # Load and merge
    print("Loading base model...")
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype="auto",
        device_map="cpu"  # Merge on CPU to save VRAM
    )
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    
    print("Loading adapter...")
    model = PeftModel.from_pretrained(model, adapter_path)
    
    print("Merging weights...")
    model = model.merge_and_unload()
    
    # Save merged
    merged_path = Path("mlops/outputs/prerna-7b-merged")
    merged_path.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(merged_path)
    tokenizer.save_pretrained(merged_path)
    
    # Convert to GGUF using llama.cpp (requires llama.cpp in PATH)
    print("Converting to GGUF...")
    subprocess.run([
        "python", "llama.cpp/convert-hf-to-gguf.py",
        "--outfile", f"mlops/outputs/{output_name}",
        "--outtype", "q4_k_m",  # Balanced quality/size for RTX 4060
        str(merged_path)
    ], check=True)
    
    print(f"Export complete: mlops/outputs/{output_name}")
    """

if __name__ == "__main__":
    export_to_gguf()
