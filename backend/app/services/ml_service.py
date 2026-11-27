"""
Machine Learning Inference & Explainability Service for ChurnIQ
Loads preprocessor.joblib and churn_model.joblib to generate real-time churn predictions,
risk tiers, contributing risk factors, and recommended retention actions.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List
import joblib
import pandas as pd
from backend.app.schemas import ChurnPredictionResult, ContributingFactor, RetentionAction
from backend.app.services.customer_service import customer_service


class MLService:
    def __init__(self):
        models_dir = Path(__file__).resolve().parent.parent.parent / "models"
        preprocessor_path = models_dir / "preprocessor.joblib"
        model_path = models_dir / "churn_model.joblib"
        perf_path = models_dir / "model_performance.json"
        meta_path = models_dir / "feature_metadata.json"

        if not preprocessor_path.exists() or not model_path.exists():
            raise FileNotFoundError("Trained model artifacts not found. Run Phase 6 and Phase 7 first.")

        self.preprocessor = joblib.load(preprocessor_path)
        self.model = joblib.load(model_path)

        with open(meta_path, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        with open(perf_path, "r", encoding="utf-8") as f:
            self.performance_data = json.load(f)

        self.input_features = self.metadata["input_features"]
        print("[MLService] Successfully loaded preprocessor and Random Forest champion model.")

    def predict_customer(self, customer_id: str) -> Dict[str, Any]:
        customer_record = customer_service.get_customer(customer_id)
        raw_record = customer_service.get_raw_record(customer_id)

        if not customer_record or not raw_record:
            raise KeyError(f"Customer with ID '{customer_id}' was not found in directory.")

        # Extract features into 1-row DataFrame
        features_dict = {col: [raw_record[col]] for col in self.input_features}
        input_df = pd.DataFrame(features_dict)

        # Preprocess & Predict Proba
        X_trans = self.preprocessor.transform(input_df)
        prob = float(self.model.predict_proba(X_trans)[0, 1])

        # Assign Risk Category
        if prob >= 0.65:
            risk_category = "High"
        elif prob >= 0.35:
            risk_category = "Medium"
        else:
            risk_category = "Low"

        # Generate Contextual Contributing Factors
        factors: List[Dict[str, Any]] = []
        contract = str(raw_record["Contract"])
        tenure = int(raw_record["tenure"])
        monthly = float(raw_record["MonthlyCharges"])
        internet = str(raw_record["InternetService"])
        tech_support = str(raw_record["TechSupport"])
        payment = str(raw_record["PaymentMethod"])

        if contract == "Month-to-month":
            factors.append(ContributingFactor(
                factor="Contract Structure",
                detail="Customer is on a flexible month-to-month plan with no long-term commitment.",
                impact="increases_risk",
                weight=92,
            ).to_dict())
        else:
            factors.append(ContributingFactor(
                factor="Contract Commitment",
                detail=f"Customer is committed to a {contract} agreement, strongly boosting retention.",
                impact="reduces_risk",
                weight=88,
            ).to_dict())

        if tenure <= 12:
            factors.append(ContributingFactor(
                factor="Tenure Vulnerability",
                detail=f"Early customer lifecycle ({tenure} months). First-year accounts have 47% churn rate.",
                impact="increases_risk",
                weight=84,
            ).to_dict())
        elif tenure >= 48:
            factors.append(ContributingFactor(
                factor="Brand Loyalty",
                detail=f"Long-term account tenure ({tenure} months) reflects established usage patterns.",
                impact="reduces_risk",
                weight=82,
            ).to_dict())

        if internet == "Fiber optic" and tech_support == "No":
            factors.append(ContributingFactor(
                factor="Unassisted Fiber Optic",
                detail="High-speed fiber connection without active Tech Support service.",
                impact="increases_risk",
                weight=80,
            ).to_dict())
        elif tech_support == "Yes":
            factors.append(ContributingFactor(
                factor="Active Tech Support",
                detail="Assisted technical support package reduces operational friction.",
                impact="reduces_risk",
                weight=72,
            ).to_dict())

        if payment == "Electronic check":
            factors.append(ContributingFactor(
                factor="Manual Payment Friction",
                detail="Electronic check billing has historically higher churn vs automatic bank debit.",
                impact="increases_risk",
                weight=75,
            ).to_dict())
        elif "automatic" in payment.lower():
            factors.append(ContributingFactor(
                factor="Automated Billing",
                detail=f"Enrolled in {payment}, minimizing missed invoices or bill shock.",
                impact="reduces_risk",
                weight=65,
            ).to_dict())

        if monthly > 80.0:
            factors.append(ContributingFactor(
                factor="High Monthly Spend",
                detail=f"Monthly charges of ${monthly:.2f} exceed portfolio average ($64.76).",
                impact="increases_risk",
                weight=68,
            ).to_dict())

        # Generate Contextual Retention Playbooks / Actions
        actions: List[Dict[str, Any]] = []
        if contract == "Month-to-month":
            actions.append(RetentionAction(
                id="act_contract_switch",
                title="1-Year Loyalty Contract Upgrade",
                description="Offer a 15% discount for 12 months in exchange for a 1-year contract lock.",
                priority="Immediate" if risk_category == "High" else "Recommended",
                estimatedImpact="Reduces churn likelihood by 31%",
            ).to_dict())

        if tech_support == "No" and internet != "No":
            actions.append(RetentionAction(
                id="act_tech_support_bundle",
                title="Complimentary VIP Tech Support",
                description="Grant 90 days of free Premium Tech Support & device protection.",
                priority="Immediate" if risk_category == "High" else "Recommended",
                estimatedImpact="Reduces technical churn by 22%",
            ).to_dict())

        if payment == "Electronic check":
            actions.append(RetentionAction(
                id="act_autopay_incentive",
                title="Auto-Pay Enrollment Credit",
                description="Provide a $10 one-time billing credit upon switching to automated bank debit.",
                priority="Recommended",
                estimatedImpact="Improves retention durability by 18%",
            ).to_dict())

        if not actions:
            actions.append(RetentionAction(
                id="act_loyalty_perk",
                title="Quarterly Relationship Check-in",
                description="Send a personalized satisfaction survey and premium loyalty perks.",
                priority="Optional",
                estimatedImpact="Strengthens customer sentiment",
            ).to_dict())

        now_iso = datetime.now(timezone.utc).isoformat()

        # Update customer's predicted riskTier in customer record
        customer_record_copy = dict(customer_record)
        customer_record_copy["riskTier"] = risk_category

        result = ChurnPredictionResult(
            customerID=customer_id,
            customer=customer_record_copy,
            churnProbability=round(prob, 4),
            riskCategory=risk_category,
            modelReference="Random Forest Classifier (v1.0 - Scikit-Learn)",
            generatedAt=now_iso,
            contributingFactors=factors[:4],
            suggestedActions=actions[:3],
            isDemoData=False,
            disclaimer="Live Prediction generated from trained Random Forest Model on Scikit-Learn.",
        )
        return result.to_dict()

    def get_model_performance(self) -> Dict[str, Any]:
        return self.performance_data


# Global singleton instance
ml_service = MLService()
