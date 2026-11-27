"""
ChurnQ Test Suite: Data Pipeline and Data Integrity Tests
=========================================================
Tests raw dataset preservation, schema adherence, zero-tenure imputation validity,
and strict categorical domain rules.
"""

import unittest
from pathlib import Path
import pandas as pd
import numpy as np


class TestDataIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data_dir = Path(__file__).resolve().parent.parent / "data"
        cls.raw_path = cls.data_dir / "WA_Fn-UseC_-Telco-Customer-Churn.csv"
        cls.cleaned_path = cls.data_dir / "cleaned_telco_churn.csv"

        cls.expected_cols = [
            "customerID", "gender", "SeniorCitizen", "Partner", "Dependents",
            "tenure", "PhoneService", "MultipleLines", "InternetService",
            "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
            "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
            "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn"
        ]

    def test_raw_dataset_exists_and_unmodified(self):
        """Verify the raw dataset is intact with exact 7,043 records and 21 columns."""
        self.assertTrue(self.raw_path.exists(), "Raw Telco CSV must exist")
        df_raw = pd.read_csv(self.raw_path)
        self.assertEqual(df_raw.shape, (7043, 21), "Raw dataset must be 7,043 x 21")
        self.assertEqual(list(df_raw.columns), self.expected_cols, "Columns and order must match schema")
        self.assertEqual(df_raw["customerID"].duplicated().sum(), 0, "No duplicate customerIDs in raw CSV")

    def test_raw_dataset_blank_total_charges(self):
        """Verify the raw dataset contains exactly 11 blank TotalCharges strings."""
        df_raw = pd.read_csv(self.raw_path)
        blank_mask = df_raw["TotalCharges"].astype(str).str.strip() == ""
        self.assertEqual(blank_mask.sum(), 11, "Raw CSV must contain exactly 11 blank TotalCharges records")
        # Every single one must have tenure == 0
        tenure_of_blanks = df_raw.loc[blank_mask, "tenure"].unique()
        self.assertEqual(list(tenure_of_blanks), [0], "All 11 blank TotalCharges must have tenure == 0")

    def test_cleaned_dataset_integrity(self):
        """Verify cleaned dataset has 7,043 rows, 0 nulls, float64 TotalCharges, and 0 duplicate IDs."""
        self.assertTrue(self.cleaned_path.exists(), "Cleaned dataset CSV must exist")
        df_clean = pd.read_csv(self.cleaned_path)
        self.assertEqual(df_clean.shape, (7043, 21), "Cleaned dataset must be 7,043 x 21")
        self.assertEqual(int(df_clean.isna().sum().sum()), 0, "Cleaned dataset must contain zero missing values")
        self.assertEqual(df_clean["customerID"].duplicated().sum(), 0, "No duplicate customer IDs")
        self.assertEqual(str(df_clean["TotalCharges"].dtype), "float64", "TotalCharges must have float64 dtype")

    def test_cleaned_zero_tenure_imputation(self):
        """Verify all zero-tenure blank accounts were properly imputed to 0.0 in cleaned dataset."""
        df_raw = pd.read_csv(self.raw_path)
        df_clean = pd.read_csv(self.cleaned_path)

        blank_ids = df_raw.loc[df_raw["TotalCharges"].astype(str).str.strip() == "", "customerID"].tolist()
        imputed_records = df_clean[df_clean["customerID"].isin(blank_ids)]

        self.assertEqual(len(imputed_records), 11, "Exactly 11 imputed records must be present")
        self.assertTrue((imputed_records["tenure"] == 0).all(), "All imputed records must have tenure == 0")
        self.assertTrue((imputed_records["TotalCharges"] == 0.0).all(), "All imputed records must have TotalCharges == 0.0")

    def test_categorical_domains(self):
        """Verify that every categorical column conforms strictly to expected domain values."""
        df_clean = pd.read_csv(self.cleaned_path)
        expected_domains = {
            "gender": {"Female", "Male"},
            "SeniorCitizen": {0, 1},
            "Partner": {"Yes", "No"},
            "Dependents": {"Yes", "No"},
            "PhoneService": {"Yes", "No"},
            "MultipleLines": {"Yes", "No", "No phone service"},
            "InternetService": {"DSL", "Fiber optic", "No"},
            "OnlineSecurity": {"Yes", "No", "No internet service"},
            "OnlineBackup": {"Yes", "No", "No internet service"},
            "DeviceProtection": {"Yes", "No", "No internet service"},
            "TechSupport": {"Yes", "No", "No internet service"},
            "StreamingTV": {"Yes", "No", "No internet service"},
            "StreamingMovies": {"Yes", "No", "No internet service"},
            "Contract": {"Month-to-month", "One year", "Two year"},
            "PaperlessBilling": {"Yes", "No"},
            "PaymentMethod": {
                "Electronic check", "Mailed check",
                "Bank transfer (automatic)", "Credit card (automatic)"
            },
            "Churn": {"Yes", "No"},
        }

        for col, valid_set in expected_domains.items():
            actual_set = set(df_clean[col].unique())
            self.assertTrue(
                actual_set.issubset(valid_set),
                f"Column '{col}' contained unexpected values: {actual_set - valid_set}"
            )


if __name__ == "__main__":
    unittest.main()
