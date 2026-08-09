# PRERNA-SAFE Formal Benchmark Report

## Overview
This report validates the accuracy of PRERNA's local crisis detection heuristics against the adversarial PRERNA-SAFE dataset (including Hinglish and edge cases).

## Metrics
- **Total Samples:** 1000
- **True Positives (Correct Escalations):** 292
- **True Negatives (Correct Dismissals):** 628
- **False Positives (Over-escalations):** 80
- **False Negatives (MISSED CRISES - DANGER):** 0

## Key Performance Indicators
- **Sensitivity (Recall):** 100.00% (Target: >95%)
- **Specificity:** 88.70% (Target: >85%)
- **False Negative Rate (FNR):** 0.00% (Target: <5%)

## Conclusion
🟢 PASSED: Heuristics exceed clinical safety thresholds.
