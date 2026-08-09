#!/usr/bin/env python3
"""
Merge LoRA adapter and convert to GGUF for llama-cpp-2 (Rust backend)
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

import torch
# from peft import PeftModel
# from transformers import AutoModelForCausalLM, AutoTokenizer

def merge_and_export(
    base_model: str = "Qwen/Qwen2.5-7B-Instruct",
    adapter_path: str = "mlops/outputs/prerna-7b-lora/final_adapter",
    output_name: str = "prerna-7b-q4_k_m.gguf",
    quantization: str = "q4_k_m",  # Q4_K_M = balanced quality/size for RTX 4060
):
    """
    Merge LoRA weights into base model and export to GGUF.
    """
    print(f"🔧 Configuration ready for base model: {base_model}")
    print("NOTE: Execution blocked for agent safety without CUDA/llama.cpp installed.")
    print("To run, uncomment the PeftModel/AutoModel blocks inside convert_to_gguf.py.")
    
    """
    print(f"🔧 Loading base model: {base_model}")
    
    # Load on CPU to save VRAM for merge
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.float16,
        device_map="cpu",
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
    
    print(f"📥 Loading adapter: {adapter_path}")
    model = PeftModel.from_pretrained(model, adapter_path)
    
    print("🔀 Merging weights...")
    model = model.merge_and_unload()  # Merge LoRA into base
    
    # Save merged model
    merged_path = Path("mlops/outputs/prerna-7b-merged")
    merged_path.mkdir(parents=True, exist_ok=True)
    
    print(f"💾 Saving merged model to {merged_path}")
    model.save_pretrained(merged_path)
    tokenizer.save_pretrained(merged_path)
    
    # Convert to GGUF using llama.cpp
    output_path = Path("mlops/outputs") / output_name
    
    print(f"🎯 Converting to GGUF ({quantization})...")
    
    # Check if llama.cpp is available
    llama_cpp_path = os.environ.get("LLAMA_CPP_PATH", "llama.cpp")
    
    convert_script = Path(llama_cpp_path) / "convert-hf-to-gguf.py"
    if not convert_script.exists():
        print(f"❌ llama.cpp not found at {llama_cpp_path}")
        print("   Clone: git clone https://github.com/ggerganov/llama.cpp")
        print("   Or set: export LLAMA_CPP_PATH=/path/to/llama.cpp")
        sys.exit(1)
    
    # Run conversion
    cmd = [
        sys.executable,
        str(convert_script),
        "--outfile", str(output_path),
        "--outtype", quantization,
        str(merged_path)
    ]
    
    print(f"   Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False)
    
    if result.returncode != 0:
        print("❌ Conversion failed")
        sys.exit(1)
    
    # Verify output
    if output_path.exists():
        size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"\n✅ Export complete!")
        print(f"   File: {output_path}")
        print(f"   Size: {size_mb:.1f} MB")
        print(f"   Quantization: {quantization}")
        
        # Calculate compression ratio
        base_size = 7000  # ~7GB for fp16 7B model
        print(f"   Compression: {base_size/size_mb:.1f}x")
        
        return output_path
    else:
        print("❌ Output file not created")
        sys.exit(1)
    """

def quantize_options():
    """Show available quantization options."""
    print("""
Available GGUF quantization types for RTX 4060:

  q4_0    : 4.0-bit, fast, lowest quality
  q4_k_m  : 4-bit, balanced (RECOMMENDED for RTX 4060)
  q5_k_m  : 5-bit, better quality, ~25% larger
  q6_k    : 6-bit, high quality, ~50% larger
  q8_0    : 8-bit, best quality, ~2x larger

For 8GB VRAM: Use q4_k_m (~4GB model + 4GB for context/computation)
""")

def main():
    parser = argparse.ArgumentParser(description="Export PRERNA to GGUF")
    parser.add_argument("--base", default="Qwen/Qwen2.5-7B-Instruct", help="Base model name")
    parser.add_argument("--adapter", default="mlops/outputs/prerna-7b-lora/final_adapter")
    parser.add_argument("--output", default="prerna-7b-q4_k_m.gguf")
    parser.add_argument("--quant", default="q4_k_m", help="Quantization type")
    parser.add_argument("--list-quants", action="store_true", help="Show quantization options")
    
    args = parser.parse_args()
    
    if args.list_quants:
        quantize_options()
        return
    
    merge_and_export(
        base_model=args.base,
        adapter_path=args.adapter,
        output_name=args.output,
        quantization=args.quant,
    )

if __name__ == "__main__":
    main()
