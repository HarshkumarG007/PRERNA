#!/bin/bash
# Complete training pipeline for PRERNA on RTX 4060

set -e  # Exit on error

echo "🚀 PRERNA Training Pipeline"
echo "============================"

# Check GPU
echo "📊 GPU Status:"
nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader || echo "NVIDIA SMI not found (CPU mode or missing driver)"

# Step 1: Generate dataset (if not exists)
if [ ! -f "mlops/data/prerna_synthetic_v1.jsonl" ]; then
    echo "📚 Generating dataset..."
    python mlops/dataset_generation/generate_dataset.py --n_examples 10000
else
    echo "📚 Dataset exists, skipping generation"
fi

# Step 2: Train QLoRA
echo "🎯 Starting QLoRA training..."
echo "   This will take ~6 hours on RTX 4060"
python mlops/fine_tuning/train_lora.py \
    --dataset mlops/data/prerna_synthetic_v1.jsonl \
    --output mlops/outputs/prerna-7b-lora \
    --epochs 3 \
    --batch_size 1 \
    --grad_accum 4 \
    --lr 2e-4

# Step 3: Export to GGUF
echo "📦 Exporting to GGUF..."
python mlops/export/convert_to_gguf.py \
    --adapter mlops/outputs/prerna-7b-lora/final_adapter \
    --output prerna-7b-q4_k_m.gguf \
    --quant q4_k_m

echo ""
echo "✅ Pipeline complete!"
echo "   Model: mlops/outputs/prerna-7b-q4_k_m.gguf"
echo ""
echo "Next steps:"
echo "  1. Copy model to src-tauri/models/"
echo "  2. Update Rust backend to use new model"
echo "  3. Run safety evaluation"
