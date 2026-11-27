"""
ChurnIQ - Phase 3: Dataset Inspection Script
===========================================
This script inspects the IBM Telco Customer Churn dataset in backend/data/
in a completely read-only, non-destructive manner.
"""

from pathlib import Path
import pandas as pd


def find_dataset(data_dir: Path) -> Path:
    """Locate the Telco Customer Churn CSV file in the data directory."""
    candidates = [
        data_dir / "WA_Fn-UseC_-Telco-Customer-Churn.csv",
        data_dir / "Telco-Customer-Churn.csv",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    # Fallback: any .csv in data_dir
    csv_files = list(data_dir.glob("*.csv"))
    if csv_files:
        return csv_files[0]

    raise FileNotFoundError(
        f"No CSV file found in {data_dir.resolve()}. "
        "Please place the IBM Telco Customer Churn dataset in backend/data/."
    )


def inspect_dataset():
    data_dir = Path(__file__).resolve().parent.parent / "data"
    dataset_path = find_dataset(data_dir)

    print("=" * 80)
    print(f"ChurnIQ: Dataset Inspection Report")
    print(f"Dataset File: {dataset_path.name}")
    print("=" * 80)

    # 1. Load raw dataset (read-only, no modifications)
    df = pd.read_csv(dataset_path)

    # 2. Dimensions
    print(f"\n[1] DATASET DIMENSIONS")
    print(f"    - Total Rows:    {df.shape[0]:,}")
    print(f"    - Total Columns: {df.shape[1]}")

    # 3. Column Names
    print(f"\n[2] COLUMN NAMES ({len(df.columns)} total):")
    for i, col in enumerate(df.columns, 1):
        print(f"    {i:2d}. {col}")

    # 4. First 5 Records
    print(f"\n[3] FIRST 5 RECORDS:")
    pd.set_option("display.max_columns", None)
    pd.set_option("display.width", 1000)
    print(df.head())

    # 5. Data Types
    print(f"\n[4] DATA TYPES:")
    print(df.dtypes.to_string())

    # 6. Missing / Null Values
    print(f"\n[5] EXPLICIT MISSING / NULL VALUES (df.isna().sum()):")
    null_counts = df.isna().sum()
    if null_counts.sum() == 0:
        print("    No explicit NaN/null values detected by standard CSV parsing.")
    else:
        print(null_counts[null_counts > 0].to_string())

    # 7. Duplicate Records & Duplicate customerID Check
    print(f"\n[6] DUPLICATE CHECK:")
    total_duplicates = df.duplicated().sum()
    print(f"    - Duplicate rows across all columns: {total_duplicates}")
    if "customerID" in df.columns:
        duplicate_id_mask = df["customerID"].duplicated(keep=False)
        duplicate_id_count = duplicate_id_mask.sum()
        print(f"    - Duplicate customerID rows:        {duplicate_id_count}")
        if duplicate_id_count > 0:
            print("    Duplicate customerID values found:")
            print(df.loc[duplicate_id_mask, ["customerID"]].drop_duplicates())
        else:
            print("    -> All customerID values are completely unique.")

    # 8. Special Inspection: TotalCharges Blanks vs Invalid Numbers
    print(f"\n[7] SPECIAL INSPECTION: TotalCharges BLANKS VS INVALID VALUES:")
    if "TotalCharges" in df.columns:
        raw_series = df["TotalCharges"].astype(str)
        # Check blank strings (whitespace only or empty)
        is_blank = raw_series.str.strip() == ""
        blank_count = int(is_blank.sum())

        # Attempt numeric conversion with coercion to NaN
        numeric_tc = pd.to_numeric(df["TotalCharges"], errors="coerce")
        is_unconvertible = numeric_tc.isna()
        total_unconvertible = int(is_unconvertible.sum())

        # Invalid non-blank values (e.g. corrupt strings, symbols, letters)
        is_invalid_non_blank = is_unconvertible & (~is_blank)
        invalid_non_blank_count = int(is_invalid_non_blank.sum())

        print(f"    - TotalCharges raw dtype in CSV:                  {df['TotalCharges'].dtype}")
        print(f"    - Blank string values (whitespace only):         {blank_count}")
        print(f"    - Invalid non-numeric values (excluding blanks): {invalid_non_blank_count}")
        print(f"    - Total unconvertible values:                    {total_unconvertible}")

        # Display records with blank or invalid TotalCharges
        anomaly_mask = is_blank | is_unconvertible
        if anomaly_mask.any():
            print(f"\n    Detailed records with blank or invalid TotalCharges ({anomaly_mask.sum()} records):")
            cols = ["customerID", "tenure", "MonthlyCharges", "TotalCharges"]
            available_cols = [c for c in cols if c in df.columns]
            print(df.loc[anomaly_mask, available_cols].to_string(index=True))
            print(f"\n    Tenure distribution for these records: {sorted(df.loc[anomaly_mask, 'tenure'].unique().tolist())}")
        else:
            print("    -> No blank or unconvertible values found in TotalCharges.")
    else:
        print("    TotalCharges column not found in dataset.")

    # 9. Unique Values in Categorical Columns
    print(f"\n[8] UNIQUE VALUES IN CATEGORICAL COLUMNS:")
    categorical_cols = [c for c in df.columns if c not in ["customerID", "TotalCharges", "tenure", "MonthlyCharges", "SeniorCitizen"]]
    for col in categorical_cols:
        unique_vals = df[col].unique()
        print(f"    - {col:<18} ({len(unique_vals):2d} unique): {list(unique_vals)}")

    # 10. Churn Distribution & Percentages
    print(f"\n[9] CHURN TARGET DISTRIBUTION:")
    if "Churn" in df.columns:
        counts = df["Churn"].value_counts(dropna=False)
        percentages = df["Churn"].value_counts(normalize=True, dropna=False) * 100
        churn_summary = pd.DataFrame({"Count": counts, "Percentage": percentages.round(2)})
        churn_summary["Percentage"] = churn_summary["Percentage"].astype(str) + "%"
        print(churn_summary)
    else:
        print("    'Churn' column not found.")

    # 11. Statistical Summary
    print(f"\n[10] NUMERICAL STATISTICAL SUMMARY (df.describe()):")
    numeric_df = df.select_dtypes(include=["number"]).copy()
    if "TotalCharges" in df.columns:
        numeric_df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    print(numeric_df.describe().T.round(2))
    print("\n" + "=" * 80)
    print("Inspection complete. No files were modified.")
    print("=" * 80)


if __name__ == "__main__":
    try:
        inspect_dataset()
    except Exception as e:
        print(f"\n[ERROR]: {e}")
