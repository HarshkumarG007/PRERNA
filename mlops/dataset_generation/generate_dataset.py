#!/usr/bin/env python3
"""
PRERNA Domain-Specific Dataset Generator v1.0
Generates 10K instruction-tuning examples for QLoRA fine-tuning.
Optimized for RTX 4060 deployment with cultural authenticity.
"""

import json
import random
import argparse
from dataclasses import dataclass, asdict
from typing import List, Literal, Dict, Optional
from pathlib import Path
from collections import Counter

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

    # Distribution targets
    DISTRIBUTION = {
        "yoga_wellness": 0.40,
        "educational": 0.30,
        "pharmacy_informed": 0.20,
        "crisis_adjacent": 0.10
    }
    
    # Big Five traits for targeted generation
    TRAITS = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
    
    # Hinglish phrases for code-switching authenticity
    HINGLISH_INSERTS = {
        "anxiety": ["yaar", "arre", "stress ho raha hai", "tension mat le"],
        "encouragement": ["tu kar sakta hai", "all the best", "bas thoda aur"],
        "frustration": ["kya yaar", "samajh nahi aa raha", "bohot ho gaya"],
        "agreement": ["haan yaar", "sahi baat", "exactly"],
        "transition": ["dekho", "sun", "samjho na"]
    }

    def __init__(self, seed: int = 42, hinglish_ratio: float = 0.3):
        random.seed(seed)
        self.hinglish_ratio = hinglish_ratio
        self.examples: List[TrainingExample] = []
        
        # Domain-specific templates
        self._init_yoga_templates()
        self._init_educational_templates()
        self._init_pharmacy_templates()
        self._init_crisis_templates()

    def _add_hinglish(self, text: str, emotion: str = "anxiety") -> str:
        """Add authentic Hinglish code-switching."""
        if random.random() > self.hinglish_ratio:
            return text
        
        inserts = self.HINGLISH_INSERTS.get(emotion, ["yaar"])
        insert = random.choice(inserts)
        
        # Insert naturally at beginning or middle
        if random.random() < 0.5:
            return f"{insert}, {text[0].lower()}{text[1:]}"
        else:
            sentences = text.split(". ")
            mid = len(sentences) // 2
            sentences[mid] = f"{insert}, {sentences[mid]}"
            return ". ".join(sentences)

    def _init_yoga_templates(self):
        """Patanjali-inspired pranayama and asana guidance."""
        self.yoga_queries = [
            ("I feel anxious before exams", "neuroticism", "anxiety"),
            ("Can't sleep properly before boards", "neuroticism", "anxiety"),
            ("My mind keeps racing with negative thoughts", "neuroticism", "anxiety"),
            ("I want to wake up early but feel lazy", "conscientiousness", "frustration"),
            ("I need energy for long study hours", "extraversion", "encouragement"),
            ("My back hurts from sitting all day", "neuroticism", "frustration"),
            ("I want to be more disciplined", "conscientiousness", "encouragement"),
            ("I feel overwhelmed by everything", "neuroticism", "anxiety"),
            ("How do I calm down quickly?", "neuroticism", "anxiety"),
            ("I want to try meditation but don't know how", "openness", "encouragement"),
            ("My parents don't understand my stress", "agreeableness", "frustration"),
            ("I feel angry all the time", "neuroticism", "frustration"),
            ("I want better focus", "conscientiousness", "encouragement"),
            ("I feel tired even after sleeping", "neuroticism", "anxiety"),
            ("How to handle exam fear?", "neuroticism", "anxiety"),
        ]
        
        self.yoga_responses = {
            "neuroticism": [
                "Let's ground this with 'Yogas chitta vritti nirodha' (Yoga Sutra 1.2). Try Nadi Shodhana: close right nostril, inhale left 4 counts, close left, exhale right 6 counts. This balances Ida and Pingala nadis, activating parasympathetic 'rest-and-digest'. Practice 5 minutes before studying.",
                "The Yoga Sutras call this 'Chitta Vikshepa' (mental distraction). Try Trataka (candle gazing): focus on flame for 2 minutes without blinking, then close eyes and visualize the afterimage. This trains Dharana (concentration) and calms the limbic system.",
                "Anxiety is future-tripping. Return to present with 'Anulom Vilom' (alternate nostril breathing) for 5 minutes. Then try 'Yoga Nidra' body scan: mentally scan from toes to head, acknowledging sensations without judgment. This is Pratyahara (withdrawal of senses) preparing for Dharana.",
                "When the mind races, try 'Bhramari Pranayama' (humming bee breath): inhale deeply, exhale with 'mmmm' sound like a bee, feeling vibration in skull. This increases nitric oxide and activates the vagus nerve, reducing anxiety physiologically.",
            ],
            "conscientiousness": [
                "Discipline is 'Tapas' in Yoga—not punishment, but consistent effort. Try 'Surya Namaskar' (Sun Salutation) 5 rounds immediately upon waking. This spikes cortisol naturally, creating alertness without caffeine. Then tackle your hardest subject during Brahma Muhurta (6-8 AM) when cognitive resources peak.",
                "For sustained focus, practice 'Ujjayi Pranayama' (ocean breath): slight constriction in throat while breathing, creating audible waves. This anchors attention to breath, training sustained concentration (Dharana). Use between Pomodoro sessions.",
                "Build 'Sthira Sukham Asanam' (Yoga Sutra 2.46): steady, comfortable posture. Physical discomfort distracts the mind. Try 'Vajrasana' (thunderbolt pose) for 5 minutes post-lunch—this aids digestion and prevents post-meal drowsiness by optimizing blood flow.",
            ],
            "extraversion": [
                "Channel your social energy inward with 'Kriya Yoga' (action yoga). Set 'Sankalpa' (intention) before each study session: 'I will complete 3 organic chemistry problems with full presence.' This directs extroverted energy toward focused achievement.",
                "Try 'Chakra Meditation' focusing on Manipura (solar plexus) for confidence. Visualize yellow light at navel center, radiating power. This balances extroversion with inner stability, preventing burnout from excessive social stimulation.",
            ],
            "agreeableness": [
                "Your empathy is strength, but boundaries are 'Ahimsa' (non-harming) toward yourself. Practice 'Maitri' (loving-kindness meditation): direct compassion first to yourself ('May I be happy'), then extend to others. You cannot pour from an empty cup.",
                "When people-pleasing overwhelms, try 'Viparita Karani' (legs-up-wall pose) for 10 minutes. This inversion signals safety to the nervous system, allowing you to distinguish genuine helpfulness from obligation.",
            ],
            "openness": [
                "Explore 'Jnana Yoga' (path of knowledge) through curiosity. Try 'Socratic questioning' on your study material: 'Why is this true? What if the opposite?' This channels openness into deep learning rather than mere novelty-seeking.",
                "Experiment with 'Candle meditation' (Trataka) but vary the object—flame, flower, yantra. Notice which captures attention effortlessly. This reveals your unique cognitive style, informing personalized study strategies.",
            ]
        }

    def _init_educational_templates(self):
        """Evidence-based study strategies aligned with Multiple Intelligences."""
        self.edu_queries = [
            ("How do I memorize faster?", "openness"),
            ("I forget everything after reading", "conscientiousness"),
            ("Math doesn't make sense to me", "openness"),
            ("I learn better by doing than reading", "extraversion"),
            ("How to take effective notes?", "conscientiousness"),
            ("I get distracted while studying", "neuroticism"),
            ("How to prepare for competitive exams?", "conscientiousness"),
            ("I understand in class but forget at home", "neuroticism"),
            ("Should I study at night or morning?", "conscientiousness"),
            ("How to manage time between subjects?", "conscientiousness"),
            ("I panic during tests even when prepared", "neuroticism"),
            ("How to explain concepts to others?", "extraversion"),
            ("I hate rote memorization", "openness"),
            ("How to stay motivated?", "extraversion"),
            ("Should I join coaching or self-study?", "openness"),
        ]
        
        self.edu_responses = {
            "logical_mathematical": "Break this into flowcharts. If X then Y. Visualize the algorithm. Create decision trees for problem types—this uses your spatial reasoning.",
            "linguistic": "Teach this concept back to an imaginary friend in your own words. If you can explain it simply, you truly understand it (Feynman Technique).",
            "spatial": "Draw a mind-map with colors. Your visual cortex encodes information differently than text. Use 'memory palace': place formulas in specific rooms of your house.",
            "bodily_kinesthetic": "Pace while memorizing—movement anchors memory. Build physical models for Chemistry. Use hand gestures for Physics vectors. Stand up for 2 minutes every 30 minutes.",
            "musical": "Set concepts to rhythm or mnemonics. Your auditory cortex is your ally. Record yourself explaining and listen during commute.",
            "interpersonal": "Study in pairs, teaching each other. Discuss aloud. Form 'study sangha' (group) with accountability. Explain concepts to friends.",
            "intrapersonal": "Journal your learning: 'What confused me today? What clicked?' Meta-cognition (thinking about thinking) strengthens memory. Self-quiz before checking answers.",
            "naturalistic": "Connect concepts to real-world phenomena. Biology through nature walks. Physics through everyday observations. Patterns in nature mirror academic patterns."
        }

    def _init_pharmacy_templates(self):
        """Chronobiology and physiology-informed (non-diagnostic) guidance."""
        self.pharma_queries = [
            ("Why do I feel sleepy after lunch?", "conscientiousness"),
            ("Best time to memorize?", "conscientiousness"),
            ("Coffee isn't working anymore", "conscientiousness"),
            ("Should I drink coffee at night?", "conscientiousness"),
            ("Why do I get headaches during exams?", "neuroticism"),
            ("Is it okay to study all night before exam?", "conscientiousness"),
            ("Why do I feel tired even after 8 hours sleep?", "neuroticism"),
            ("Best time for creative thinking?", "openness"),
            ("How to avoid afternoon slump?", "conscientiousness"),
            ("Should I take supplements for memory?", "openness"),
        ]
        
        self.pharma_responses = [
            "That's your 'postprandial dip'—blood flow shifts to digestive tract after eating, temporarily reducing cerebral perfusion. Heavy carbs spike insulin, increasing tryptophan transport to brain (melatonin precursor). Try lighter lunch, 10-minute walk post-meal, and save analytical work for 5 PM cortisol resurgence.",
            "Caffeine has 5-6 hour half-life; 25% remains in system 10 hours later. If you drink coffee at 10 PM, you're still processing it at 8 AM next day, fragmenting sleep architecture. Sleep deprivation costs more in memory consolidation than cramming gains. Use coffee for morning battles, not midnight ones.",
            "Your cortisol awakening response (CAR) peaks 30-60 minutes after waking—this is your prime study window for difficult material. Save lighter review for 2-4 PM post-lunch dip. Creative thinking peaks during 'evening relaxation' when prefrontal cortex loosens grip—try 6-8 PM for brainstorming.",
            "Headaches have many causes: dehydration (check last water intake), eye strain (20-20-20 rule: every 20 min, look 20 feet away for 20 sec), tension (trapezius stretches), or caffeine withdrawal. Try 'Shitali Pranayama' (cooling breath) for cranial tension relief. If frequent or severe, see doctor—don't self-medicate without diagnosis.",
            "Memory supplements lack consistent evidence. What works: sleep (memory consolidation in REM), aerobic exercise (increases BDNF—'fertilizer for neurons'), and spaced repetition. Optimize basics before adding variables. Your brain is already powerful.",
        ]

    def _init_crisis_templates(self):
        """Safety-first: validation, referral, never diagnosis."""
        self.crisis_queries = [
            "I don't want to live anymore",
            "I think about ending my life",
            "Everyone would be better off without me",
            "I can't handle this pressure anymore",
            "I have pills and I'm thinking of taking them all",
            "I cut myself to feel better",
            "I think I have depression and nobody cares",
            "I want to hurt myself",
            "There's no point in anything",
            "I'm scared of what I might do",
        ]
        
        self.crisis_response = (
            "I'm really worried about you right now, and I want you to know that you're not alone in feeling this way—even though it might feel like it. "
            "I'm not a therapist, and I can't provide the help you deserve, but I can help you find someone who can. "
            "Please call the KIRAN Mental Health Helpline right now at 1800-599-0019—it's free, confidential, and they have counselors who specialize in helping people through exactly these feelings. "
            "If you're not ready to call, is there a teacher, counselor, or family member you trust who I could help you reach out to? "
            "You matter, and there are people who want to support you through this."
        )

    def generate_yoga_example(self, query: str, trait: str, emotion: str) -> TrainingExample:
        """Generate Yoga/Wellness example with trait-specific technique."""
        response = random.choice(self.yoga_responses.get(trait, self.yoga_responses["neuroticism"]))
        technique = response.split("Try")[1].split(":")[0].strip() if "Try" in response else "pranayama"
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": self._add_hinglish(query, emotion)},
                {"role": "assistant", "content": response}
            ],
            metadata={
                "domain": "yoga_wellness",
                "target_trait": trait,
                "safety_category": "safe",
                "technique": technique.lower().replace(" ", "_"),
                "source": "patanjali_sutras",
                "has_hinglish": self.hinglish_ratio > 0
            }
        )

    def generate_educational_example(self, query: str, trait: str) -> TrainingExample:
        """Generate educational strategy aligned with Multiple Intelligences."""
        # Map trait to preferred intelligence
        trait_to_mi = {
            "openness": random.choice(["naturalistic", "intrapersonal", "linguistic"]),
            "conscientiousness": random.choice(["logical_mathematical", "intrapersonal"]),
            "extraversion": random.choice(["interpersonal", "bodily_kinesthetic", "musical"]),
            "agreeableness": "interpersonal",
            "neuroticism": "intrapersonal"
        }
        mi_type = trait_to_mi.get(trait, "logical_mathematical")
        strategy = self.edu_responses[mi_type]
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": query},
                {"role": "assistant", "content": f"Based on your profile, try this: {strategy} Which subject feels most challenging right now?"}
            ],
            metadata={
                "domain": "educational",
                "target_trait": trait,
                "safety_category": "safe",
                "technique": mi_type,
                "source": "multiple_intelligences_theory"
            }
        )

    def generate_pharmacy_example(self, query: str, trait: str) -> TrainingExample:
        """Generate physiology-informed (non-diagnostic) guidance."""
        response = random.choice(self.pharma_responses)
        
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": query},
                {"role": "assistant", "content": response + " Not medical advice—just biology timing!"}
            ],
            metadata={
                "domain": "pharmacy_informed",
                "target_trait": trait,
                "safety_category": "safe",
                "technique": "chronobiology",
                "source": "physiology_education"
            }
        )

    def generate_crisis_example(self, query: str) -> TrainingExample:
        """Generate safety-first crisis response."""
        return TrainingExample(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": query},
                {"role": "assistant", "content": self.crisis_response}
            ],
            metadata={
                "domain": "crisis_adjacent",
                "target_trait": "neuroticism",
                "safety_category": "crisis_escalation_candidate",
                "technique": "immediate_referral",
                "source": "safety_protocol_v1"
            }
        )

    def generate_dataset(self, n_examples: int = 10000, output_path: Optional[Path] = None):
        """Generate balanced dataset across domains."""
        output_path = output_path or Path("mlops/data/prerna_synthetic_v1.jsonl")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Calculate counts per domain
        counts = {k: int(n_examples * v) for k, v in self.DISTRIBUTION.items()}
        
        # Adjust for rounding
        counts["yoga_wellness"] += n_examples - sum(counts.values())
        
        print(f"Generating {n_examples} examples:")
        for domain, count in counts.items():
            print(f"  - {domain}: {count}")
        
        examples = []
        
        # Generate Yoga/Wellness (40%)
        for _ in range(counts["yoga_wellness"]):
            query, trait, emotion = random.choice(self.yoga_queries)
            examples.append(self.generate_yoga_example(query, trait, emotion))
        
        # Generate Educational (30%)
        for _ in range(counts["educational"]):
            query, trait = random.choice(self.edu_queries)
            examples.append(self.generate_educational_example(query, trait))
        
        # Generate Pharmacy-informed (20%)
        for _ in range(counts["pharmacy_informed"]):
            query, trait = random.choice(self.pharma_queries)
            examples.append(self.generate_pharmacy_example(query, trait))
        
        # Generate Crisis-adjacent (10%)
        for _ in range(counts["crisis_adjacent"]):
            query = random.choice(self.crisis_queries)
            examples.append(self.generate_crisis_example(query))
        
        # Shuffle
        random.shuffle(examples)
        
        # Write
        with open(output_path, 'w', encoding='utf-8') as f:
            for ex in examples:
                f.write(ex.to_jsonl() + '\n')
        
        print(f"\n[DONE] Dataset written to: {output_path}")
        self._validate_dataset(output_path, counts)
        
        return output_path

    def _validate_dataset(self, path: Path, expected_counts: Dict):
        """Validate schema and safety invariants."""
        print("\n[INFO] Validating dataset...")
        
        actual_counts = Counter()
        crisis_count = 0
        safety_issues = []
        
        with open(path, encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                try:
                    data = json.loads(line)
                    
                    # Schema validation
                    assert "messages" in data and len(data["messages"]) == 3, f"Line {i}: Invalid messages"
                    assert "metadata" in data, f"Line {i}: Missing metadata"
                    
                    meta = data["metadata"]
                    assert meta["safety_category"] in ["safe", "crisis_escalation_candidate"], f"Line {i}: Invalid safety_category"
                    
                    # Crisis checks
                    if meta["safety_category"] == "crisis_escalation_candidate":
                        crisis_count += 1
                        response = data["messages"][2]["content"].lower()
                        if "1800-599-0019" not in response:
                            safety_issues.append(f"Line {i}: Crisis response missing helpline")
                        if any(x in response for x in ["i understand", "that makes sense", "have you tried"]):
                            safety_issues.append(f"Line {i}: Crisis response contains minimizing language")
                    
                    actual_counts[meta["domain"]] += 1
                    
                except Exception as e:
                    print(f"[ERROR] Validation error at line {i}: {e}")
                    raise
        
        # Distribution check
        print("\n[INFO] Distribution verification:")
        for domain, expected in expected_counts.items():
            actual = actual_counts[domain]
            pct = (actual / sum(actual_counts.values())) * 100
            print(f"  {domain}: {actual} ({pct:.1f}%) [target: {expected}]")
        
        print(f"\n[WARN] Crisis candidates: {crisis_count} ({crisis_count/sum(actual_counts.values())*100:.1f}%)")
        
        if safety_issues:
            print(f"\n[FAIL] Safety issues found: {len(safety_issues)}")
            for issue in safety_issues[:5]:
                print(f"  - {issue}")
            raise ValueError("Safety validation failed")
        
        print("\n[PASS] All validations passed")

def main():
    parser = argparse.ArgumentParser(description="Generate PRERNA training dataset")
    parser.add_argument("--n_examples", type=int, default=10000, help="Number of examples")
    parser.add_argument("--output", type=str, default="mlops/data/prerna_synthetic_v1.jsonl")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--hinglish_ratio", type=float, default=0.3, help="Ratio of Hinglish code-switching")
    args = parser.parse_args()
    
    gen = PrernaDatasetGenerator(seed=args.seed, hinglish_ratio=args.hinglish_ratio)
    gen.generate_dataset(n_examples=args.n_examples, output_path=Path(args.output))

if __name__ == "__main__":
    main()
