"""
Customer Directory Service for ChurnIQ
Loads cleaned_telco_churn.csv and deterministically enriches records
with display fields (name, email, segment, riskTier, ageGroup, support tickets)
to satisfy frontend Customer interface.
"""

import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd


FIRST_NAMES_F = [
    "Elena", "Sophia", "Olivia", "Emma", "Isabella", "Mia", "Amelia", "Harper",
    "Evelyn", "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", "Maya",
    "Chloe", "Camila", "Penelope", "Layla", "Grace", "Zoey", "Nora", "Lily",
    "Hannah", "Lillian", "Addison", "Aubrey", "Ellie", "Stella", "Natalie", "Zoe"
]

FIRST_NAMES_M = [
    "Marcus", "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry",
    "Lucas", "Benjamin", "Theodore", "Mateo", "Levi", "Sebastian", "Daniel", "Jack",
    "Alexander", "Owen", "Asher", "Samuel", "Ethan", "Leo", "Jackson", "Hudson",
    "Ezra", "John", "David", "Carter", "Wyatt", "Luke", "Julian", "Jayden"
]

LAST_NAMES = [
    "Vance", "Thorne", "Sterling", "Kovacs", "Sinclair", "Holloway", "Mercer", "Blackwood",
    "Chen", "Patel", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
    "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
    "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott"
]


class CustomerService:
    def __init__(self):
        data_dir = Path(__file__).resolve().parent.parent.parent / "data"
        cleaned_path = data_dir / "cleaned_telco_churn.csv"
        if not cleaned_path.exists():
            raise FileNotFoundError(f"Cleaned dataset not found at {cleaned_path}. Run Phase 4 first.")

        raw_df = pd.read_csv(cleaned_path)
        self.raw_records_by_id: Dict[str, Dict[str, Any]] = {
            str(row["customerID"]).strip().upper(): row.to_dict() for _, row in raw_df.iterrows()
        }
        self.customers: List[Dict[str, Any]] = [self._enrich_record(row) for _, row in raw_df.iterrows()]
        self.customers_by_id: Dict[str, Dict[str, Any]] = {c["customerID"].upper(): c for c in self.customers}
        print(f"[CustomerService] Initialized {len(self.customers):,} enriched customer records.")

    def _enrich_record(self, row: pd.Series) -> Dict[str, Any]:
        cid = str(row["customerID"]).strip()
        gender = str(row["gender"]).strip()
        h = int(hashlib.md5(cid.encode("utf-8")).hexdigest(), 16)

        # Deterministic Name & Email
        if gender == "Female":
            first_name = FIRST_NAMES_F[h % len(FIRST_NAMES_F)]
        else:
            first_name = FIRST_NAMES_M[h % len(FIRST_NAMES_M)]
        last_name = LAST_NAMES[(h // 100) % len(LAST_NAMES)]
        full_name = f"{first_name} {last_name}"
        email = f"{first_name.lower()}.{last_name.lower()}@example.com"

        # Age Group
        senior = int(row["SeniorCitizen"])
        if senior == 1:
            age_group = "60+"
        else:
            sub_bins = ["18-29", "30-44", "45-59"]
            age_group = sub_bins[(h // 50) % len(sub_bins)]

        # Risk Tier derivation
        tenure = int(row["tenure"])
        monthly = float(row["MonthlyCharges"])
        contract = str(row["Contract"])
        churn = str(row["Churn"])

        if churn == "Yes":
            risk_tier = "High"
        elif contract == "Month-to-month" and monthly > 70.0:
            risk_tier = "High"
        elif contract == "Month-to-month" or tenure <= 12:
            risk_tier = "Medium"
        else:
            risk_tier = "Low"

        # Segment derivation
        if churn == "Yes":
            segment = "Lost"
        elif monthly > 85.0 and tenure > 24:
            segment = "High-Value"
        elif tenure > 36:
            segment = "Loyal"
        elif tenure <= 6:
            segment = "New"
        elif risk_tier == "High":
            segment = "At-Risk"
        else:
            segment = "Price-Sensitive"

        # Support Tickets in past 90 days
        tech_support = str(row["TechSupport"])
        internet = str(row["InternetService"])
        base_tickets = (h // 20) % 3
        if internet == "Fiber optic" and tech_support == "No":
            base_tickets += 2
        if churn == "Yes":
            base_tickets += 1
        support_tickets = min(6, base_tickets)

        # Last Active Date
        if churn == "Yes":
            day_offset = 30 + ((h // 10) % 60)
        else:
            day_offset = 1 + ((h // 10) % 14)
        last_active = f"2026-11-{max(1, 28 - (day_offset % 27)):02d}"

        return {
            "customerID": cid,
            "name": full_name,
            "email": email,
            "gender": gender,
            "SeniorCitizen": senior,
            "ageGroup": age_group,
            "Partner": str(row["Partner"]),
            "Dependents": str(row["Dependents"]),
            "tenure": tenure,
            "PhoneService": str(row["PhoneService"]),
            "MultipleLines": str(row["MultipleLines"]),
            "InternetService": internet,
            "OnlineSecurity": str(row["OnlineSecurity"]),
            "TechSupport": tech_support,
            "StreamingTV": str(row["StreamingTV"]),
            "Contract": contract,
            "PaperlessBilling": str(row["PaperlessBilling"]),
            "PaymentMethod": str(row["PaymentMethod"]),
            "MonthlyCharges": monthly,
            "TotalCharges": float(row["TotalCharges"]),
            "Churn": churn,
            "segment": segment,
            "riskTier": risk_tier,
            "lastActive": last_active,
            "supportTickets90d": support_tickets,
        }

    def get_customer(self, customer_id: str) -> Optional[Dict[str, Any]]:
        cid = customer_id.strip().upper()
        if cid in self.customers_by_id:
            return self.customers_by_id[cid]
        clean_key = cid.replace("CUST-", "").strip()
        for k, c in self.customers_by_id.items():
            if k == clean_key or k.startswith(clean_key):
                return c
        return None

    def get_raw_record(self, customer_id: str) -> Optional[Dict[str, Any]]:
        cid = customer_id.strip().upper()
        if cid in self.raw_records_by_id:
            return self.raw_records_by_id[cid]
        clean_key = cid.replace("CUST-", "").strip()
        for k, r in self.raw_records_by_id.items():
            if k == clean_key or k.startswith(clean_key):
                return r
        return None

    def get_customers(
        self,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "tenure",
        sort_dir: str = "desc",
        search: Optional[str] = None,
        gender: Optional[str] = None,
        contract: Optional[str] = None,
        payment_method: Optional[str] = None,
        internet_service: Optional[str] = None,
        status: Optional[str] = None,
        tenure_range: Optional[str] = None,
        segment: Optional[str] = None,
    ) -> Dict[str, Any]:
        filtered = self.customers

        # Search
        if search and search.strip():
            s = search.strip().lower()
            filtered = [
                c for c in filtered
                if s in c["customerID"].lower()
                or s in c["name"].lower()
                or s in c["email"].lower()
                or s in c["Contract"].lower()
                or s in c["segment"].lower()
            ]

        # Filters
        if gender and gender != "All":
            filtered = [c for c in filtered if c["gender"] == gender]
        if contract and contract != "All":
            filtered = [c for c in filtered if c["Contract"] == contract]
        if payment_method and payment_method != "All":
            filtered = [c for c in filtered if c["PaymentMethod"] == payment_method]
        if internet_service and internet_service != "All":
            filtered = [c for c in filtered if c["InternetService"] == internet_service]
        if status and status != "All":
            filtered = [c for c in filtered if c["Churn"] == status]
        if tenure_range and tenure_range != "All":
            if tenure_range == "0-12":
                filtered = [c for c in filtered if c["tenure"] <= 12]
            elif tenure_range == "13-24":
                filtered = [c for c in filtered if 13 <= c["tenure"] <= 24]
            elif tenure_range == "25-48":
                filtered = [c for c in filtered if 25 <= c["tenure"] <= 48]
            elif tenure_range == "49+":
                filtered = [c for c in filtered if c["tenure"] >= 49]
        if segment and segment != "All":
            filtered = [c for c in filtered if c["segment"].lower() == segment.lower()]

        # Sorting
        risk_order = {"High": 3, "Medium": 2, "Low": 1}
        reverse = (sort_dir.lower() == "desc")

        def sort_key(c: Dict[str, Any]):
            if sort_by == "riskTier":
                return risk_order.get(c["riskTier"], 0)
            val = c.get(sort_by, 0)
            if isinstance(val, str):
                return val.lower()
            return val

        sorted_customers = sorted(filtered, key=sort_key, reverse=reverse)

        # Pagination
        total = len(sorted_customers)
        page_size = max(1, page_size)
        total_pages = max(1, (total + page_size - 1) // page_size)
        current_page = min(max(1, page), total_pages)
        start = (current_page - 1) * page_size
        items = sorted_customers[start : start + page_size]

        return {
            "items": items,
            "total": total,
            "page": current_page,
            "pageSize": page_size,
            "totalPages": total_pages,
            "isDemoData": False,
        }


# Global singleton instance
customer_service = CustomerService()
