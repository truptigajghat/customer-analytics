"""
ChurnIQ - Phase 6: Feature Engineering & Preprocessing Pipeline
==============================================================
This script builds and serializes the production preprocessing pipeline:
- Separates target (Churn: 0/1) and identifiers (customerID)
- Defines numerical features (StandardScaler) and categorical features (OneHotEncoder)
- Fits ColumnTransformer on 80% Stratified Training Split (random_state=42)
- Serializes preprocessor pipeline to backend/models/preprocessor.joblib
- Saves train/test splits and feature metadata for Phase 7 model training
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def build_pipeline():
    data_dir = Path(__file__).resolve().parent.parent / "data"
    models_dir = Path(__file__).resolve().parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    cleaned_path = data_dir / "cleaned_telco_churn.csv"
    if not cleaned_path.exists():
        raise FileNotFoundError(f"Cleaned dataset not found at {cleaned_path.resolve()}. Complete Phase 4 first.")

    df = pd.read_csv(cleaned_path)
    print("=" * 80)
    print("ChurnIQ - Phase 6: Feature Engineering Pipeline")
    print(f"Dataset: {cleaned_path.name} ({len(df):,} records)")
    print("=" * 80)

    # 1. Target Encoding
    print("\n[STEP 1] Target Variable Encoding (Churn -> 0/1)...")
    y = df["Churn"].map({"No": 0, "Yes": 1}).astype(int)
    customer_ids = df["customerID"]

    # 2. Feature Definitions
    numeric_features = ["tenure", "MonthlyCharges", "TotalCharges"]
    categorical_features = [
        "gender",
        "SeniorCitizen",
        "Partner",
        "Dependents",
        "PhoneService",
        "MultipleLines",
        "InternetService",
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies",
        "Contract",
        "PaperlessBilling",
        "PaymentMethod",
    ]

    feature_cols = numeric_features + categorical_features
    X = df[feature_cols].copy()

    print(f"    - Numeric features ({len(numeric_features)}):     {numeric_features}")
    print(f"    - Categorical features ({len(categorical_features)}): {categorical_features}")
    print(f"    - Total input features:            {len(feature_cols)}")

    # 3. Stratified Train-Test Split (80/20)
    print("\n[STEP 2] Creating Stratified Train/Test Split (80/20, random_state=42)...")
    X_train, X_test, y_train, y_test, ids_train, ids_test = train_test_split(
        X, y, customer_ids, test_size=0.20, random_state=42, stratify=y
    )

    print(f"    - Training Set: {len(X_train):,} rows (Churn: {y_train.mean()*100:.2f}%)")
    print(f"    - Test Set:     {len(X_test):,} rows (Churn: {y_test.mean()*100:.2f}%)")

    # 4. Construct Scikit-Learn ColumnTransformer
    print("\n[STEP 3] Constructing Scikit-Learn ColumnTransformer...")
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            (
                "cat",
                OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False),
                categorical_features,
            ),
        ],
        verbose_feature_names_out=False,
    )

    # 5. Fit Preprocessor on Training Data Only (Prevents Data Leakage)
    print("\n[STEP 4] Fitting Preprocessor on Training Data...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)

    # Extract engineered feature names
    feature_names = preprocessor.get_feature_names_out().tolist()
    print(f"    - Engineered Features Generated: {len(feature_names)}")
    for i, fn in enumerate(feature_names[:10], 1):
        print(f"      {i:2d}. {fn}")
    print(f"      ... and {len(feature_names) - 10} more features")

    # 6. Serialize Preprocessor Pipeline & Metadata
    print("\n[STEP 5] Serializing Preprocessor Artifacts...")
    preprocessor_path = models_dir / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    print(f"    - Saved fitted preprocessor to: {preprocessor_path.name}")

    metadata = {
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "input_features": feature_cols,
        "engineered_features": feature_names,
        "num_engineered_features": len(feature_names),
        "target_mapping": {"No": 0, "Yes": 1},
        "train_size": len(X_train),
        "test_size": len(X_test),
        "random_state": 42,
    }

    metadata_path = models_dir / "feature_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"    - Saved pipeline metadata to:   {metadata_path.name}")

    # 7. Save Train/Test Data Split
    split_payload = {
        "X_train": X_train_transformed,
        "X_test": X_test_transformed,
        "y_train": y_train.to_numpy(),
        "y_test": y_test.to_numpy(),
        "X_train_raw": X_train,
        "X_test_raw": X_test,
        "ids_train": ids_train.to_numpy(),
        "ids_test": ids_test.to_numpy(),
        "feature_names": feature_names,
    }
    split_path = data_dir / "train_test_split.joblib"
    joblib.dump(split_payload, split_path)
    print(f"    - Saved train/test data to:     {split_path.name}")

    print("\n" + "=" * 80)
    print("Phase 6 Feature Engineering Complete. Ready for Phase 7 (Model Training).")
    print("=" * 80)


if __name__ == "__main__":
    try:
        build_pipeline()
    except Exception as e:
        print(f"\n[ERROR]: {e}")
        raise
