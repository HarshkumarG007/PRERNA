#!/usr/bin/env python3
"""
PRERNA Domain-Specific Dataset Generator
Generates instruction-tuning data blending Yoga, Pharmacy, Education, and Crisis-aware content.
"""

import json
import random
import argparse
import os
from dataclasses import dataclass, asdict
from typing import List, Literal
from pathlib import Path

@dataclass
class TrainingExample:
    messages: List[dict]
    metadata: dict
    
    def to_jsonl(self) -> str:
        return json.dumps({
            "messages": self.messages,
            "metadata": self.metadata
        }, ensure_ascii=False)

class PrernaDatasetGenerator:
    SYSTEM_PROMPT = """You are PRERNA, a supportive self-discovery companion for Indian adolescents. 
You integrate yoga philosophy, evidence-based study techniques, and emotional awareness. 
You never diagnose medical or mental health conditions. 
You encourage professional help when appropriate."""
    
    DOMAINS = Literal["yoga_wellness", "pharmacy_informed", "educational", "crisis_adjacent", "general"]
    TRAITS = Literal["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.examples: List[TrainingExample] = []
        self.traits_list = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
        
    def _yoga_response(self, query: str, trait: str) -> str:
        """Generate Yoga/Naturopathy-informed response based on trait profile."""
        templates = {
            "neuroticism": [
                "Let's try a grounding pranayama—Nadi Shodhana (alternate nostril breathing) for 5 minutes. This balances the Ida and Pingala nadis, which can help when the mind feels scattered...",
                "From the Yoga Sutras, 'Yogas chitta vritti nirodha'—yoga is the cessation of mental fluctuations. Try this: 4-7-8 breathing (inhale 4, hold 7, exhale 8) before opening your books..."
            ],
            "conscientiousness": [
                "Since you have strong focus capacity, let's optimize it with Kapalabhati (skull-shining breath) for 3 minutes to energize the prefrontal cortex, then dive into your hardest problem first..."
            ],
            "openness": [
                "Try this experimental approach from Swami Vivekananda's teachings: alternate between 25 minutes of deep work and 10 minutes of self-reflection journaling. Track which feels more aligned with your natural rhythm..."
            ]
        }
        return random.choice(templates.get(trait, templates["neuroticism"]))
    
    def _pharmacy_informed_response(self, query: str, context: str) -> str:
        """Non-diagnostic, physiology-aware guidance."""
        return (
            f"Your body clock (circadian rhythm) affects cognition significantly. "
            f"Since you mentioned {context}, consider: your cortisol peaks 30-60 minutes after waking—that's your prime study window. "
            f"Save lighter review for the post-lunch dip (2-4 PM) when melatonin precursors naturally rise. "
            f"Not medical advice—just biology timing."
        )
    
    def _educational_response(self, query: str, intelligence_type: str) -> str:
        """Multiple Intelligences-aligned study strategies."""
        strategies = {
            "logical_mathematical": "Break this into a flowchart. If X then Y. Visualize the algorithm.",
            "linguistic": "Teach this concept back to an imaginary friend in your own words.",
            "spatial": "Draw a mind-map with colors. Your visual cortex will encode it differently.",
            "bodily_kinesthetic": "Stand up and pace while reciting. Movement anchors memory.",
            "musical": "Set this to a rhythm or mnemonic. Your auditory cortex is your ally."
        }
        return strategies.get(intelligence_type, strategies["logical_mathematical"])
    
    def _crisis_adjacent_response(self, query: str) -> str:
        """Safety-first: validate, resource, never diagnose."""
        return (
            "That sounds really heavy, and I want you to know you're not alone in feeling this way. "
            "I'm not a therapist, and I can't diagnose what's happening—but I can help you find someone who can. "
            "Would you like me to show you the KIRAN helpline (1800-599-0019) or help you think about which trusted adult in your life might understand? "
            "Your safety matters more than your studies right now."
        )
    
    def generate_yoga_example(self, trait: str = "neuroticism") -> TrainingExample:
        queries = [
            "I feel anxious before exams",
            "My mind won't stop racing at night",
            "I can't sit still to study",
            "I feel overwhelmed by everything"
        ]
        query = random.choice(queries)
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": query},
                {"role": "assistant", "content": self._yoga_response(query, trait)}
            ],
            metadata={
                "domain": "yoga_wellness",
                "target_trait": trait,
                "safety_category": "safe",
                "technique": "pranayama",
                "source": "patanjali_sutras_modern_interpretation"
            }
        )
    
    def generate_pharmacy_example(self) -> TrainingExample:
        queries = [
            ("Why do I feel sleepy after lunch?", "postprandial dip"),
            ("Best time to memorize?", "circadian peak"),
            ("Coffee isn't working anymore", "caffeine tolerance")
        ]
        query, context = random.choice(queries)
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": query},
                {"role": "assistant", "content": self._pharmacy_informed_response(query, context)}
            ],
            metadata={
                "domain": "pharmacy_informed",
                "target_trait": "conscientiousness",
                "safety_category": "safe",
                "technique": "chronobiology",
                "source": "physiology_education"
            }
        )
    
    def generate_crisis_example(self) -> TrainingExample:
        queries = [
            "I think I might hurt myself",
            "I don't see the point anymore",
            "Everyone would be better off without me",
            "I can't handle this pressure anymore"
        ]
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": random.choice(queries)},
                {"role": "assistant", "content": self._crisis_adjacent_response("")}
            ],
            metadata={
                "domain": "crisis_adjacent",
                "target_trait": "neuroticism",
                "safety_category": "crisis_escalation_candidate",
                "technique": "validation_and_referral",
                "source": "safety_protocol_v1"
            }
        )
        
    def generate_educational_example(self) -> TrainingExample:
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": "How do I memorize faster?"},
                {"role": "assistant", "content": self._educational_response("", "spatial")}
            ],
            metadata={"domain": "educational", "target_trait": "openness", "safety_category": "safe", "technique": "mi_theory"}
        )
    
    def generate_dataset(self, n_examples: int = 5000, output_path: Path = None):
        """Generate balanced dataset across domains."""
        output_path = output_path or Path("mlops/data/prerna_synthetic_v1.jsonl")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Distribution: 40% yoga, 30% educational, 20% pharmacy, 10% crisis
        weights = [0.4, 0.3, 0.2, 0.1]
        generators = [
            lambda: self.generate_yoga_example(random.choice(self.traits_list)),
            lambda: self.generate_educational_example(),
            self.generate_pharmacy_example,
            self.generate_crisis_example
        ]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            for _ in range(n_examples):
                generator = random.choices(generators, weights=weights)[0]
                example = generator()
                f.write(example.to_jsonl() + '\n')
        
        print(f"Generated {n_examples} examples -> {output_path}")
        self._validate_dataset(output_path)
    
    def _validate_dataset(self, path: Path):
        """Schema validation and safety audit."""
        crisis_count = 0
        total = 0
        with open(path) as f:
            for line in f:
                total += 1
                data = json.loads(line)
                # Verify required fields
                assert "messages" in data and len(data["messages"]) == 3
                assert "metadata" in data
                assert data["metadata"]["safety_category"] in ["safe", "crisis_escalation_candidate"]
                if data["metadata"]["safety_category"] == "crisis_escalation_candidate":
                    crisis_count += 1
        
        print(f"Validation passed. Crisis candidates: {crisis_count} ({(crisis_count/max(1, total))*100:.1f}%)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PRERNA Dataset Generator")
    parser.add_argument("--n_examples", type=int, default=5000, help="Number of examples to generate")
    parser.add_argument("--review_mode", action="store_true", help="Generate small sample to stdout")
    args = parser.parse_args()

    gen = PrernaDatasetGenerator(seed=42)
    output_path = Path(os.path.join(os.path.dirname(__file__), "..", "data", "prerna_synthetic_v1.jsonl"))
    
    gen.generate_dataset(n_examples=args.n_examples, output_path=output_path)
    
    if args.review_mode:
        print("\n--- REVIEW MODE OUTPUT ---")
        with open(output_path, 'r') as f:
            for i, line in enumerate(f):
                if i >= 3: # show 3 examples for review
                    break
                print(json.dumps(json.loads(line), indent=2))
                print("-" * 40)
