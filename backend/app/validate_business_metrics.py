"""
ChurnIQ - Business & Financial Metric Actuarial Validation
=========================================================
Validates active vs churned customer counts, portfolio MRR vs active MRR,
deterministic MRR at risk, and actuarial probability-weighted expected loss.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

def run_business_validation():
    backend_dir = Path(__file__).resolve().parent.parent
    data_path = backend_dir / "data" / "cleaned_telco_churn.csv"
    preprocessor_path = backend_dir / "models" / "preprocessor.joblib"
    model_path = backend_dir / "models" / "churn_model.joblib"

    if not data_path.exists():
        raise FileNotFoundError(f"Cleaned data not found at {data_path}")

    df = pd.read_csv(data_path)
    preprocessor = joblib.load(preprocessor_path)
    model = joblib.load(model_path)

    # 1. Base counts & distributions
    total_customers = len(df)
    active_mask = (df["Churn"] == "No")
    churned_mask = (df["Churn"] == "Yes")

    active_count = int(active_mask.sum())
    churned_count = int(churned_mask.sum())
    churn_rate_pct = (churned_count / total_customers) * 100

    # 2. Revenue (MRR) Breakdown
    active_mrr = float(df.loc[active_mask, "MonthlyCharges"].sum())
    churned_mrr = float(df.loc[churned_mask, "MonthlyCharges"].sum())
    total_portfolio_mrr = float(df["MonthlyCharges"].sum())

    # 3. Contract Breakdown
    contract_dist = {}
    for contract, grp in df.groupby("Contract"):
        c_active = int((grp["Churn"] == "No").sum())
        c_churn = int((grp["Churn"] == "Yes").sum())
        c_total = len(grp)
        contract_dist[contract] = {
            "total": c_total,
            "active": c_active,
            "churned": c_churn,
            "churn_rate_pct": round((c_churn / c_total) * 100, 2),
            "mrr": round(float(grp["MonthlyCharges"].sum()), 2),
            "active_mrr": round(float(grp.loc[grp["Churn"] == "No", "MonthlyCharges"].sum()), 2)
        }

    m2m_churn_concentration = (contract_dist["Month-to-month"]["churned"] / churned_count) * 100

    # 4. Model Predictions across Active Population (5,174 accounts)
    feature_cols = [c for c in df.columns if c not in ["customerID", "Churn"]]
    X_active_raw = df.loc[active_mask, feature_cols]
    X_active_trans = preprocessor.transform(X_active_raw)
    active_probs = model.predict_proba(X_active_trans)[:, 1]

    active_monthly_charges = df.loc[active_mask, "MonthlyCharges"].values

    # Actuarial Probability-Weighted MRR Loss: E[Loss] = sum(p_i * MRR_i)
    prob_weighted_loss = float(np.sum(active_probs * active_monthly_charges))

    # Deterministic MRR at Risk:
    # High-Risk Tier: P >= 0.65
    high_risk_mask = active_probs >= 0.65
    high_risk_count = int(np.sum(high_risk_mask))
    high_risk_mrr = float(np.sum(active_monthly_charges[high_risk_mask]))

    # Moderate-Risk Tier: 0.35 <= P < 0.65
    mod_risk_mask = (active_probs >= 0.35) & (active_probs < 0.65)
    mod_risk_count = int(np.sum(mod_risk_mask))
    mod_risk_mrr = float(np.sum(active_monthly_charges[mod_risk_mask]))

    # Low-Risk Tier: P < 0.35
    low_risk_mask = active_probs < 0.35
    low_risk_count = int(np.sum(low_risk_mask))
    low_risk_mrr = float(np.sum(active_monthly_charges[low_risk_mask]))

    print("=" * 80)
    print("CHURNQ V1.0 - BUSINESS & FINANCIAL METRIC ACTUARIAL AUDIT")
    print("=" * 80)
    print(f"Customer Population:")
    print(f"  - Total Historical Records:    {total_customers:,}")
    print(f"  - Retained Active Customers:   {active_count:,} ({active_count/total_customers*100:.2f}%)")
    print(f"  - Historical Churned Accounts: {churned_count:,} ({churned_count/total_customers*100:.2f}%)")
    print("\nMonthly Recurring Revenue (MRR) Accounting:")
    print(f"  - Total Dataset Cumulative MRR: ${total_portfolio_mrr:,.2f}")
    print(f"  - Active Retained Monthly MRR:  ${active_mrr:,.2f} (Current recurring billing baseline)")
    print(f"  - Historical Lost Churned MRR:  ${churned_mrr:,.2f} (Pre-existing attrition baseline)")
    print("\nContract Churn Concentration:")
    for c_name, c_data in contract_dist.items():
        print(f"  - {c_name:<16}: Total={c_data['total']:,} | Churned={c_data['churned']:,} ({c_data['churn_rate_pct']}%) | Active MRR=${c_data['active_mrr']:,.2f}")
    print(f"  * Month-to-month churn concentration: {m2m_churn_concentration:.2f}% of all historical churn events.")

    print("\nRisk Exposure & Actuarial Valuation (Active Customer Portfolio):")
    print(f"  - Deterministic High-Risk MRR (P >= 0.65):   ${high_risk_mrr:,.2f} across {high_risk_count:,} accounts")
    print(f"  - Deterministic Moderate-Risk (0.35 <= P < 0.65): ${mod_risk_mrr:,.2f} across {mod_risk_count:,} accounts")
    print(f"  - Deterministic Low-Risk MRR (P < 0.35):    ${low_risk_mrr:,.2f} across {low_risk_count:,} accounts")
    print(f"  - Actuarial Probability-Weighted MRR Loss:   ${prob_weighted_loss:,.2f}/month")
    print(f"    (Calculated as E[Loss] = SUM_i [ P(Churn_i) * MRR_i ] across all 5,174 active accounts)")
    print("=" * 80)

    # Save artifact
    output_path = backend_dir / "models" / "business_metrics_audit.json"
    audit_payload = {
        "customer_population": {
            "total_customers": total_customers,
            "active_customers": active_count,
            "churned_customers": churned_count,
            "churn_rate_pct": round(churn_rate_pct, 2)
        },
        "revenue_metrics": {
            "total_dataset_mrr": round(total_portfolio_mrr, 2),
            "active_mrr": round(active_mrr, 2),
            "churned_mrr": round(churned_mrr, 2)
        },
        "contracts": contract_dist,
        "m2m_churn_concentration_pct": round(m2m_churn_concentration, 2),
        "risk_exposure": {
            "high_risk_p65": {"count": high_risk_count, "mrr_at_risk": round(high_risk_mrr, 2)},
            "moderate_risk_p35_p65": {"count": mod_risk_count, "mrr_at_risk": round(mod_risk_mrr, 2)},
            "low_risk_under_p35": {"count": low_risk_count, "mrr_at_risk": round(low_risk_mrr, 2)},
            "actuarial_expected_mrr_loss": round(prob_weighted_loss, 2)
        }
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(audit_payload, f, indent=2)
    print(f"Audit results saved to {output_path.resolve()}")

if __name__ == "__main__":
    run_business_validation()
