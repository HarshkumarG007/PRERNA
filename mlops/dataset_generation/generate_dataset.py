import json
import os
import random

def generate_synthetic_data(raw_text_files):
    """
    Template script for transforming domain-specific raw texts (Yoga, Pharmacy, Naturopathy)
    into high-quality Instruction-Response pairs for LLM fine-tuning.
    
    In production, this would use a large 'teacher' model (like Llama-3-70B or GPT-4) 
    prompted to generate diverse scenarios matching PRERNA's safety guidelines.
    """
    dataset = []
    
    # Hardcoded examples demonstrating the desired tone (empathetic, non-diagnostic, educational)
    examples = [
        {
            "instruction": "I'm feeling really stressed about my upcoming exams and can't sleep.",
            "response": "It's completely normal to feel overwhelmed before exams. One technique from Yoga practice that might help you settle your nervous system before bed is a simple 4-7-8 breathing exercise: inhale for 4 seconds, hold for 7, and exhale for 8. Would you like to try that together, or would you rather talk about what's making you most anxious about the exams?"
        },
        {
            "instruction": "I have a headache, should I take ibuprofen or paracetamol?",
            "response": "I can share general information about those, but I cannot recommend or prescribe medication for you. Both ibuprofen and paracetamol are common over-the-counter options, but they work differently in the body. It is always best to check with your pharmacist or a parent to see which is appropriate for you right now."
        },
        {
            "instruction": "I feel like I'm not good at anything.",
            "response": "That's a really heavy feeling to carry around. Sometimes when we are struggling, our minds focus only on the negatives. In our Life Quests, we look at hidden strengths—like how being a good listener or being observant are massive skills. What is something you enjoy doing, even if you don't think you're 'perfect' at it?"
        }
    ]
    
    for _ in range(50):
        # In a real pipeline, we dynamically generate hundreds/thousands of these
        dataset.append(random.choice(examples))
        
    return dataset

def main():
    print("Starting PRERNA Dataset Generation Pipeline...")
    
    # Load raw documents
    # raw_docs = load_documents("../../raw_data/")
    
    generated_data = generate_synthetic_data([])
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "prerna_synthetic_dataset.jsonl")
    
    with open(output_file, "w") as f:
        for item in generated_data:
            f.write(json.dumps(item) + "\n")
            
    print(f"Successfully generated {len(generated_data)} instruction-response pairs.")
    print(f"Dataset saved to {output_file}")

if __name__ == "__main__":
    main()
