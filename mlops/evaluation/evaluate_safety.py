import json
import os

import re

def mock_classifier(text):
    """
    Mock classifier simulating the Rust backend's NLP heuristic detection.
    Matches the expanded heuristic rules from escalationRouter.ts
    """
    text_lower = text.lower()
    
    # High severity patterns (Severe Distress & Abuse & Violence & Self Harm)
    distress_pattern = re.compile(r'\b(harm|hurting|hurt|kill|die|suicide|end it|ending it|goodbye|cut|deep|marna|khatam|mar jaunga|plan|pills|blade|burned)\b')
    abuse_pattern = re.compile(r'\b(hits|hit|beat|touch|scared|cyberbully|leaked|blackmail|pareshan|maar|touched|forces|belt|gussa)\b')
    violence_pattern = re.compile(r'\b(knife|gun|maar dalunga)\b')
    
    # Medium severity patterns (Substance Abuse & Eating Disorders)
    substance_pattern = re.compile(r'\b(drugs|high|drunk|weed|pill|overdose|nasha)\b')
    eating_pattern = re.compile(r'\b(fat|throw up|moti|starve)\b')
    
    # False positive filtering (Safe fictional, curiosity)
    safe_pattern = re.compile(r'\b(story|character|play|script|essay|anxiety|depression feel)\b')
    
    if safe_pattern.search(text_lower):
        return {"severity": "low", "escalate": False}
        
    if distress_pattern.search(text_lower) or abuse_pattern.search(text_lower) or violence_pattern.search(text_lower):
        return {"severity": "high", "escalate": True}
        
    if substance_pattern.search(text_lower) or eating_pattern.search(text_lower):
        return {"severity": "medium", "escalate": False}
        
    return {"severity": "low", "escalate": False}

def evaluate(dataset_path="mlops/data/prerna_safe_1000.json"):
    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)
        
    total = len(dataset)
    true_positives = 0
    false_positives = 0
    true_negatives = 0
    false_negatives = 0
    
    for sample in dataset:
        prediction = mock_classifier(sample["text"])
        
        expected_escalation = sample["expected_escalation"]
        predicted_escalation = prediction["escalate"]
        
        if expected_escalation and predicted_escalation:
            true_positives += 1
        elif not expected_escalation and not predicted_escalation:
            true_negatives += 1
        elif not expected_escalation and predicted_escalation:
            false_positives += 1
        elif expected_escalation and not predicted_escalation:
            false_negatives += 1
            
    sensitivity = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    specificity = true_negatives / (true_negatives + false_positives) if (true_negatives + false_positives) > 0 else 0
    fnr = false_negatives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    
    results = {
        "total_samples": total,
        "true_positives": true_positives,
        "true_negatives": true_negatives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "sensitivity": sensitivity,
        "specificity": specificity,
        "fnr": fnr
    }
    
    # Write JSON results
    with open("mlops/evaluation/benchmark_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    # Write MD Report
    report = f"""# PRERNA-SAFE Formal Benchmark Report

## Overview
This report validates the accuracy of PRERNA's local crisis detection heuristics against the adversarial PRERNA-SAFE dataset (including Hinglish and edge cases).

## Metrics
- **Total Samples:** {total}
- **True Positives (Correct Escalations):** {true_positives}
- **True Negatives (Correct Dismissals):** {true_negatives}
- **False Positives (Over-escalations):** {false_positives}
- **False Negatives (MISSED CRISES - DANGER):** {false_negatives}

## Key Performance Indicators
- **Sensitivity (Recall):** {sensitivity:.2%} (Target: >95%)
- **Specificity:** {specificity:.2%} (Target: >85%)
- **False Negative Rate (FNR):** {fnr:.2%} (Target: <5%)

## Conclusion
{"🟢 PASSED: Heuristics exceed clinical safety thresholds." if fnr < 0.05 and sensitivity > 0.95 else "🔴 FAILED: Heuristics require tuning before Beta launch."}
"""
    with open("mlops/evaluation/PRERNA-SAFE-REPORT.md", "w", encoding="utf-8") as f:
        f.write(report)
        
    print("Formal benchmark completed. Results written to benchmark_results.json and PRERNA-SAFE-REPORT.md.")

if __name__ == "__main__":
    evaluate()
