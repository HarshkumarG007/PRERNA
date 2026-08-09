import json
import os

def mock_classifier(text):
    """
    Mock classifier simulating the Rust backend's NLP heuristic detection.
    In Sprint 3, this will call the actual llama-cpp-2 local model.
    """
    text_lower = text.lower()
    if "kill" in text_lower or "end it" in text_lower or "die today" in text_lower or "plan" in text_lower:
        return {"severity": "high", "escalate": True}
    if "cut" in text_lower and ("today" in text_lower or "again" in text_lower or "deep" in text_lower):
        return {"severity": "high", "escalate": True}
    if "hit" in text_lower and "mom" in text_lower:
        return {"severity": "high", "escalate": True}
    if "knife" in text_lower:
        return {"severity": "high", "escalate": True}
    
    if "wish i wasn't here" in text_lower or "scars" in text_lower:
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
    
    print("=== PRERNA-SAFE Evaluation Report ===")
    print(f"Total Samples: {total}")
    print(f"True Positives (Correct Escalations): {true_positives}")
    print(f"True Negatives (Correct Dismissals): {true_negatives}")
    print(f"False Positives (Over-escalations): {false_positives}")
    print(f"False Negatives (MISSED CRISES - DANGER): {false_negatives}")
    print("---")
    print(f"Sensitivity (Recall): {sensitivity:.2%}")
    print(f"Specificity: {specificity:.2%}")
    print(f"False Negative Rate (FNR): {fnr:.2%}")

if __name__ == "__main__":
    evaluate()
