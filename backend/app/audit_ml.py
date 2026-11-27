import joblib
import json
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

split = joblib.load('backend/data/train_test_split.joblib')
X_test = split['X_test']
y_test = split['y_test']

rf = joblib.load('backend/models/churn_model.joblib')
lr = joblib.load('backend/models/logistic_regression.joblib')

with open('backend/models/model_performance.json') as f:
    saved_perf = json.load(f)

print("=== MACHINE LEARNING EVALUATION AUDIT ===")
for name, model in [('Random Forest (Champion)', rf), ('Logistic Regression', lr)]:
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)
    cm = confusion_matrix(y_test, preds)
    print(f"\nModel: {name}")
    print(f"  - Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"  - Precision: {prec:.4f} ({prec*100:.2f}%)")
    print(f"  - Recall:    {rec:.4f} ({rec*100:.2f}%)")
    print(f"  - F1 Score:  {f1:.4f} ({f1*100:.2f}%)")
    print(f"  - ROC-AUC:   {auc:.4f} ({auc*100:.2f}%)")
    print(f"  - Confusion Matrix: TN={cm[0,0]}, FP={cm[0,1]}, FN={cm[1,0]}, TP={cm[1,1]}")

print("\nSaved JSON in backend/models/model_performance.json:")
for m in saved_perf['models']:
    print(f"  {m['name']:25} | acc={m['accuracy']} prec={m['precision']} rec={m['recall']} f1={m['f1Score']} auc={m['rocAuc']}")
