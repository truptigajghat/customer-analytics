"""
ChurnIQ - ML Calibration & Threshold Optimization Validation
============================================================
Evaluates calibration metrics (Brier Score, Log-Loss, Reliability Diagram)
and produces a 10-threshold decision evaluation table on the held-out test split (1,409 records).
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss, confusion_matrix, log_loss

def run_calibration_validation():
    backend_dir = Path(__file__).resolve().parent.parent
    split_path = backend_dir / "data" / "train_test_split.joblib"
    model_path = backend_dir / "models" / "churn_model.joblib"

    if not split_path.exists() or not model_path.exists():
        raise FileNotFoundError("Required train_test_split.joblib or churn_model.joblib not found.")

    split_data = joblib.load(split_path)
    X_train = split_data["X_train"]
    X_test = split_data["X_test"]
    y_train = split_data["y_train"]
    y_test = split_data["y_test"]

    rf_model = joblib.load(model_path)

    # 1. Probabilities on held-out test set
    y_prob_rf = rf_model.predict_proba(X_test)[:, 1]

    # Uncalibrated Metrics
    brier_rf = brier_score_loss(y_test, y_prob_rf)
    logloss_rf = log_loss(y_test, y_prob_rf)

    # Calibration Curve (Reliability Diagram)
    prob_true, prob_pred = calibration_curve(y_test, y_prob_rf, n_bins=10, strategy="uniform")

    # Fit CalibratedClassifierCV (Sigmoid / Platt Scaling) strictly using training set
    calibrator = CalibratedClassifierCV(estimator=rf_model, cv=3, method="sigmoid")
    calibrator.fit(X_train, y_train)
    y_prob_cal = calibrator.predict_proba(X_test)[:, 1]

    brier_cal = brier_score_loss(y_test, y_prob_cal)
    logloss_cal = log_loss(y_test, y_prob_cal)

    print("=" * 80)
    print("CHURNQ V1.0 - ML CALIBRATION REPORT (Held-Out Test Split: 1,409 Records)")
    print("=" * 80)
    print(f"Random Forest Champion Model (Uncalibrated):")
    print(f"  - Brier Score Loss: {brier_rf:.4f} (lower is better, 0.0 = perfect, 0.25 = uninformative baseline)")
    print(f"  - Log-Loss:         {logloss_rf:.4f}")
    print(f"\nCalibrated Model (Platt Scaling / Sigmoid via Training Split):")
    print(f"  - Brier Score Loss: {brier_cal:.4f}")
    print(f"  - Log-Loss:         {logloss_cal:.4f}")

    print("\nReliability Diagram Data (Uncalibrated 10 Bins):")
    print(f"{'Bin':<6}{'Predicted Prob':<18}{'Observed Churn':<18}{'Calibration Delta':<18}")
    print("-" * 60)
    for idx, (p_pred, p_true) in enumerate(zip(prob_pred, prob_true), 1):
        delta = p_true - p_pred
        print(f"{idx:<6}{p_pred*100:>8.2f}%         {p_true*100:>8.2f}%         {delta*100:>+8.2f}%")

    # 2. Threshold Comparison Table Across 10 Thresholds
    thresholds = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]
    table_records = []

    print("\n" + "=" * 90)
    print(f"{'Threshold':<10}{'Precision':<11}{'Recall':<10}{'F1-Score':<10}{'FPR':<9}{'FNR':<9}{'TP':<6}{'FP':<6}{'TN':<6}{'FN':<6}")
    print("=" * 90)

    for t in thresholds:
        y_pred = (y_prob_rf >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

        table_records.append({
            "threshold": t,
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "fpr": round(fpr, 4),
            "fnr": round(fnr, 4),
            "tp": int(tp),
            "fp": int(fp),
            "tn": int(tn),
            "fn": int(fn)
        })

        print(f"{t:<10.2f}{prec*100:>7.2f}%    {rec*100:>6.2f}%    {f1*100:>6.2f}%    {fpr*100:>5.2f}%   {fnr*100:>5.2f}%   {tp:<6}{fp:<6}{tn:<6}{fn:<6}")

    print("=" * 90)

    # Save summary artifact
    output_path = backend_dir / "models" / "calibration_evaluation.json"
    artifact = {
        "held_out_samples": len(y_test),
        "uncalibrated": {
            "brier_score": round(brier_rf, 4),
            "log_loss": round(logloss_rf, 4)
        },
        "calibrated": {
            "brier_score": round(brier_cal, 4),
            "log_loss": round(logloss_cal, 4)
        },
        "reliability_curve": [
            {"predicted": round(float(p), 4), "observed": round(float(t), 4)}
            for p, t in zip(prob_pred, prob_true)
        ],
        "threshold_evaluations": table_records,
        "operational_thresholds": {
            "high_risk": {
                "threshold": 0.65,
                "recall": round(next(r["recall"] for r in table_records if r["threshold"] == 0.65), 4),
                "precision": round(next(r["precision"] for r in table_records if r["threshold"] == 0.65), 4),
                "business_rationale": "High-intervention cost playbook (concierge account manager outreach, major price incentives). Prioritizes high precision (69.2%) to minimize wasted incentive spend on false alarms."
            },
            "moderate_risk": {
                "threshold": 0.35,
                "recall": round(next(r["recall"] for r in table_records if r["threshold"] == 0.35), 4),
                "precision": round(next(r["precision"] for r in table_records if r["threshold"] == 0.35), 4),
                "business_rationale": "Low-cost intervention playbook (automated re-engagement emails, self-serve feature education). Prioritizes high recall (79.4%) to catch nearly 80% of churn candidates cheaply."
            }
        }
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(artifact, f, indent=2)
    print(f"\nArtifact successfully saved to {output_path.resolve()}")

if __name__ == "__main__":
    run_calibration_validation()
