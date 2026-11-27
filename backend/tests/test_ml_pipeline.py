"""
ChurnQ Test Suite: Machine Learning Pipeline & Model Validation Tests
=====================================================================
Tests preprocessor pipeline, model serialization, probability boundary adherence,
data leakage prevention, and model evaluation metric integrity.
"""

import json
from pathlib import Path
import unittest
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score, roc_auc_score


class TestMLPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.models_dir = Path(__file__).resolve().parent.parent / "models"
        cls.data_dir = Path(__file__).resolve().parent.parent / "data"

        cls.preprocessor_path = cls.models_dir / "preprocessor.joblib"
        cls.model_path = cls.models_dir / "churn_model.joblib"
        cls.meta_path = cls.models_dir / "feature_metadata.json"
        cls.perf_path = cls.models_dir / "model_performance.json"
        cls.split_path = cls.data_dir / "train_test_split.joblib"

        cls.preprocessor = joblib.load(cls.preprocessor_path)
        cls.model = joblib.load(cls.model_path)
        with open(cls.meta_path, "r", encoding="utf-8") as f:
            cls.metadata = json.load(f)
        with open(cls.perf_path, "r", encoding="utf-8") as f:
            cls.perf_data = json.load(f)
        cls.split_data = joblib.load(cls.split_path)

    def test_preprocessor_structure(self):
        """Verify preprocessor is a fitted ColumnTransformer with StandardScaler and OneHotEncoder."""
        self.assertTrue(self.preprocessor_path.exists())
        transformer_names = [t[0] for t in self.preprocessor.transformers_]
        self.assertIn("num", transformer_names)
        self.assertIn("cat", transformer_names)
        self.assertEqual(len(self.metadata["numeric_features"]), 3)
        self.assertEqual(len(self.metadata["categorical_features"]), 16)
        self.assertEqual(len(self.metadata["input_features"]), 19)
        self.assertEqual(len(self.metadata["engineered_features"]), 30)

    def test_data_leakage_prevention(self):
        """Verify target and identifier columns are strictly excluded from feature inputs."""
        input_cols = self.metadata["input_features"]
        engineered_cols = self.metadata["engineered_features"]

        leaking_terms = ["churn", "customerid", "risktier", "segment", "lastactive"]
        for col in input_cols:
            for term in leaking_terms:
                self.assertNotIn(term, col.lower(), f"Potential data leak detected in input feature: {col}")

        for col in engineered_cols:
            for term in leaking_terms:
                self.assertNotIn(term, col.lower(), f"Potential data leak detected in engineered feature: {col}")

    def test_champion_model_structure(self):
        """Verify the champion model is an ensemble Random Forest with 150 estimators."""
        self.assertIsInstance(self.model, RandomForestClassifier)
        self.assertEqual(len(self.model.estimators_), 150)
        self.assertEqual(self.model.random_state, 42)
        self.assertEqual(self.model.class_weight, "balanced")

    def test_prediction_probability_bounds(self):
        """Verify prediction probabilities on test set are strictly bounded between 0.0 and 1.0."""
        X_test = self.split_data["X_test"]
        probs = self.model.predict_proba(X_test)[:, 1]

        self.assertGreaterEqual(float(probs.min()), 0.0, "Minimum probability must be >= 0.0")
        self.assertLessEqual(float(probs.max()), 1.0, "Maximum probability must be <= 1.0")
        self.assertGreater(len(np.unique(probs)), 1000, "Probabilities must not be fixed/dummy constants")

    def test_different_customers_produce_different_probabilities(self):
        """Verify that contrasting customer profiles produce divergent churn probabilities."""
        # Profile A: Month-to-month, high spend, tenure=1, electronic check (High risk profile)
        sample_high = pd.DataFrame([{
            "tenure": 1, "MonthlyCharges": 89.5, "TotalCharges": 89.5,
            "gender": "Female", "SeniorCitizen": 0, "Partner": "No", "Dependents": "No",
            "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "Fiber optic",
            "OnlineSecurity": "No", "OnlineBackup": "No", "DeviceProtection": "No",
            "TechSupport": "No", "StreamingTV": "Yes", "StreamingMovies": "Yes",
            "Contract": "Month-to-month", "PaperlessBilling": "Yes",
            "PaymentMethod": "Electronic check"
        }])

        # Profile B: Two year, low spend, tenure=60, automatic bank debit (Low risk profile)
        sample_low = pd.DataFrame([{
            "tenure": 60, "MonthlyCharges": 20.0, "TotalCharges": 1200.0,
            "gender": "Male", "SeniorCitizen": 0, "Partner": "Yes", "Dependents": "Yes",
            "PhoneService": "Yes", "MultipleLines": "No", "InternetService": "No",
            "OnlineSecurity": "No internet service", "OnlineBackup": "No internet service",
            "DeviceProtection": "No internet service", "TechSupport": "No internet service",
            "StreamingTV": "No internet service", "StreamingMovies": "No internet service",
            "Contract": "Two year", "PaperlessBilling": "No",
            "PaymentMethod": "Bank transfer (automatic)"
        }])

        trans_high = self.preprocessor.transform(sample_high)
        trans_low = self.preprocessor.transform(sample_low)

        prob_high = float(self.model.predict_proba(trans_high)[0, 1])
        prob_low = float(self.model.predict_proba(trans_low)[0, 1])

        self.assertGreater(prob_high, prob_low, "High-risk profile must have higher probability than low-risk profile")
        self.assertGreater(prob_high, 0.60, f"Expected high risk > 0.60, got {prob_high}")
        self.assertLess(prob_low, 0.25, f"Expected low risk < 0.25, got {prob_low}")

    def test_test_set_evaluation_benchmarks(self):
        """Verify model performance on held-out test split meets production benchmarks."""
        X_test = self.split_data["X_test"]
        y_test = self.split_data["y_test"]

        preds = self.model.predict(X_test)
        probs = self.model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        rec = recall_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)

        self.assertGreater(acc, 0.72, f"Accuracy must exceed 72%, got {acc:.4f}")
        self.assertGreater(rec, 0.75, f"Recall must exceed 75% for retention, got {rec:.4f}")
        self.assertGreater(auc, 0.82, f"ROC-AUC must exceed 82%, got {auc:.4f}")

    def test_model_performance_json_metrics_in_fraction_format(self):
        """Verify that model_performance.json metrics are saved as standard fractions in [0, 1]."""
        for m in self.perf_data["models"]:
            for key in ["accuracy", "precision", "recall", "f1Score", "rocAuc"]:
                val = m[key]
                self.assertLessEqual(val, 1.0, f"Metric '{key}' for '{m['id']}' must be in [0, 1], found {val}")
                self.assertGreaterEqual(val, 0.0, f"Metric '{key}' for '{m['id']}' must be >= 0, found {val}")


if __name__ == "__main__":
    unittest.main()
