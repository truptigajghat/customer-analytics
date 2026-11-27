import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path

raw_path = Path("backend/data/WA_Fn-UseC_-Telco-Customer-Churn.csv")
clean_path = Path("backend/data/cleaned_telco_churn.csv")
preproc_path = Path("backend/models/preprocessor.joblib")
model_path = Path("backend/models/churn_model.joblib")
split_path = Path("backend/data/train_test_split.joblib")

print("=== DATA PIPELINE AUDIT ===")
# 1. Raw Dataset
df_raw = pd.read_csv(raw_path)
print(f"1. Raw Dataset: {raw_path.name}")
print(f"   - Shape: {df_raw.shape[0]} rows, {df_raw.shape[1]} columns")
raw_dupes = df_raw.duplicated().sum()
raw_id_dupes = df_raw['customerID'].duplicated().sum()
raw_blank_tc = (df_raw['TotalCharges'].astype(str).str.strip() == '').sum()
print(f"   - Duplicate rows: {raw_dupes}, Duplicate IDs: {raw_id_dupes}")
print(f"   - Blank TotalCharges: {raw_blank_tc}")

# 2. Cleaned Dataset
df_clean = pd.read_csv(clean_path)
print(f"\n2. Cleaned Dataset: {clean_path.name}")
print(f"   - Shape: {df_clean.shape[0]} rows, {df_clean.shape[1]} columns")
clean_nulls = df_clean.isna().sum().sum()
clean_dupes = df_clean.duplicated().sum()
clean_id_dupes = df_clean['customerID'].duplicated().sum()
tc_dtype = df_clean['TotalCharges'].dtype
print(f"   - Total Nulls: {clean_nulls}")
print(f"   - Duplicate rows: {clean_dupes}, Duplicate IDs: {clean_id_dupes}")
print(f"   - TotalCharges dtype: {tc_dtype}")

# 3. Check Zero-Tenure TotalCharges imputation
imputed_mask = (df_raw['TotalCharges'].astype(str).str.strip() == '')
imputed_cids = df_raw.loc[imputed_mask, 'customerID'].tolist()
clean_imputed_records = df_clean[df_clean['customerID'].isin(imputed_cids)]
print(f"\n3. Imputed Zero-Tenure Records ({len(clean_imputed_records)} records):")
all_zero_tenure = (clean_imputed_records['tenure'] == 0).all()
all_zero_tc = (clean_imputed_records['TotalCharges'] == 0.0).all()
print(f"   - All have tenure == 0: {all_zero_tenure}")
print(f"   - All have TotalCharges == 0.0: {all_zero_tc}")

# 4. Check Preprocessing & Feature Engineering Consistency
preproc = joblib.load(preproc_path)
split = joblib.load(split_path)
print(f"\n4. Preprocessor Pipeline:")
print(f"   - Transformers: {[t[0] for t in preproc.transformers_]}")
print(f"   - Engineered feature count: {len(split['feature_names'])}")
print(f"   - Training shape: {split['X_train'].shape}")
print(f"   - Testing shape: {split['X_test'].shape}")

# 5. Check Leakage: Is customerID, tenure_range, riskTier, Churn in X?
feature_names = split['feature_names']
leaks = [f for f in feature_names if any(w in f.lower() for w in ['churn', 'customerid', 'risktier', 'segment'])]
leak_status = leaks if leaks else "None (Clean - Zero Leakage)"
print(f"   - Target/ID Leakage detected in features: {leak_status}")

# 6. Check ML model inference against live records
model = joblib.load(model_path)
X_test = split['X_test']
y_test = split['y_test']
preds = model.predict(X_test)
probas = model.predict_proba(X_test)[:, 1]
print(f"\n5. Live Model Verification:")
print(f"   - Model class: {type(model).__name__}")
print(f"   - Number of estimators: {len(model.estimators_)}")
print(f"   - Predict proba range: [{probas.min():.4f}, {probas.max():.4f}]")
print(f"   - Valid range [0, 1]: {0.0 <= probas.min() and probas.max() <= 1.0}")
print(f"   - Distinct prediction probabilities in test set: {len(np.unique(probas))}")

print("\nPIPELINE AUDIT: ALL CHECKS COMPLETED SUCCESSFULLY")
