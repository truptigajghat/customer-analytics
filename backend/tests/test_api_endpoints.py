"""
ChurnQ Test Suite: API Endpoint Integration Tests
==================================================
Tests every REST/ASGI endpoint: status codes, response schemas, pagination,
filtering, sorting, error guards, live predictions, and analytical metrics.
"""

import json
import unittest
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"


def api_call(endpoint: str, method: str = "GET", payload: dict = None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    if payload is not None:
        req.add_header("Content-Type", "application/json")
        body = json.dumps(payload).encode("utf-8")
    else:
        body = None
    try:
        with urllib.request.urlopen(req, data=body, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return resp.status, data
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            data = json.loads(raw)
        except Exception:
            data = {"raw": raw}
        return e.code, data


class TestApiEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Verify server is up
        try:
            status, data = api_call("/health")
            cls.server_online = (status == 200)
        except Exception:
            cls.server_online = False

    def setUp(self):
        if not self.server_online:
            self.skipTest(f"Backend server is offline at {BASE_URL}. Start Uvicorn to run live API tests.")

    def test_health_check(self):
        """Verify GET /health returns 200 with healthy status and metadata."""
        status, data = api_call("/health")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["version"], "1.0.0")
        self.assertIn("Random Forest", data["champion_model"])

    def test_get_customers_pagination(self):
        """Verify GET /api/v1/customers pagination defaults and total count."""
        status, data = api_call("/api/v1/customers?page=1&page_size=10")
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 7043)
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["pageSize"], 10)
        self.assertEqual(len(data["items"]), 10)
        self.assertFalse(data["isDemoData"])

    def test_get_customers_search(self):
        """Verify search query filters customers correctly by ID."""
        status, data = api_call("/api/v1/customers?search=7590-VHVEG")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["total"], 1)
        self.assertEqual(data["items"][0]["customerID"], "7590-VHVEG")

    def test_get_customers_filtering(self):
        """Verify categorical filtering (Contract = Two year)."""
        status, data = api_call("/api/v1/customers?contract=Two%20year&page_size=5")
        self.assertEqual(status, 200)
        for customer in data["items"]:
            self.assertEqual(customer["Contract"], "Two year")

    def test_get_customers_segment_filter(self):
        """Verify segment filtering (segment = At-Risk)."""
        status, data = api_call("/api/v1/customers?segment=At-Risk&page_size=5")
        self.assertEqual(status, 200)
        for customer in data["items"]:
            self.assertEqual(customer["segment"], "At-Risk")

    def test_get_customer_by_id_exact(self):
        """Verify GET /api/v1/customers/{customerId} for exact customerID."""
        status, data = api_call("/api/v1/customers/7590-VHVEG")
        self.assertEqual(status, 200)
        self.assertEqual(data["customerID"], "7590-VHVEG")
        self.assertEqual(data["gender"], "Female")
        self.assertEqual(data["Contract"], "Month-to-month")
        self.assertEqual(data["MonthlyCharges"], 29.85)

    def test_get_customer_by_id_prefix_resolution(self):
        """Verify customer lookup resolves prefixed CUST-7590 to 7590-VHVEG."""
        status, data = api_call("/api/v1/customers/CUST-7590")
        self.assertEqual(status, 200)
        self.assertEqual(data["customerID"], "7590-VHVEG")

    def test_get_customer_by_id_not_found(self):
        """Verify invalid customerID returns HTTP 404."""
        status, data = api_call("/api/v1/customers/NON-EXISTENT-ID")
        self.assertEqual(status, 404)
        self.assertIn("not found", data.get("detail", "").lower())

    def test_predict_churn_high_risk(self):
        """Verify POST /api/v1/predict generates high-risk prediction for 7590-VHVEG."""
        status, data = api_call("/api/v1/predict", method="POST", payload={"customer_id": "7590-VHVEG"})
        self.assertEqual(status, 200)
        self.assertEqual(data["customerID"], "7590-VHVEG")
        self.assertGreaterEqual(data["churnProbability"], 0.65)
        self.assertEqual(data["riskCategory"], "High")
        self.assertIn("Random Forest", data["modelReference"])
        self.assertFalse(data["isDemoData"])
        self.assertGreater(len(data["contributingFactors"]), 0)
        self.assertGreater(len(data["suggestedActions"]), 0)

    def test_predict_churn_low_risk(self):
        """Verify POST /api/v1/predict generates low-risk prediction for 5575-GNVDE."""
        status, data = api_call("/api/v1/predict", method="POST", payload={"customer_id": "5575-GNVDE"})
        self.assertEqual(status, 200)
        self.assertEqual(data["customerID"], "5575-GNVDE")
        self.assertLess(data["churnProbability"], 0.35)
        self.assertEqual(data["riskCategory"], "Low")

    def test_predict_churn_empty_body_guard(self):
        """Verify POST /api/v1/predict with empty payload returns HTTP 400 Bad Request."""
        status, data = api_call("/api/v1/predict", method="POST", payload={})
        self.assertEqual(status, 400)
        self.assertIn("customer_id", data.get("detail", ""))

    def test_predict_churn_invalid_customer_guard(self):
        """Verify POST /api/v1/predict with nonexistent ID returns HTTP 404."""
        status, data = api_call("/api/v1/predict", method="POST", payload={"customer_id": "NON-EXISTENT-ID"})
        self.assertEqual(status, 404)
        self.assertIn("not found", data.get("detail", "").lower())

    def test_model_performance_endpoint(self):
        """Verify GET /api/v1/models/performance returns 3 models and valid curve points."""
        status, data = api_call("/api/v1/models/performance")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["models"]), 3)
        self.assertEqual(len(data["rocCurve"]), 50)
        self.assertEqual(len(data["precisionRecallCurve"]), 50)
        self.assertFalse(data["isDemoData"])

        rf = next(m for m in data["models"] if m["id"] == "random_forest")
        self.assertGreater(rf["accuracy"], 0.70)
        self.assertGreater(rf["recall"], 0.75)
        self.assertGreater(rf["rocAuc"], 0.80)

    def test_analytics_overview_endpoint(self):
        """Verify GET /api/v1/analytics/overview returns 6 KPIs and 12 monthly cohort trends."""
        status, data = api_call("/api/v1/analytics/overview?range=12m")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["kpis"]), 6)
        self.assertEqual(len(data["monthlyTrends"]), 12)
        self.assertFalse(data["isDemoData"])

    def test_customer_analytics_endpoint(self):
        """Verify GET /api/v1/analytics/customers returns distributions for all attributes."""
        status, data = api_call("/api/v1/analytics/customers")
        self.assertEqual(status, 200)
        self.assertEqual(data["totalCustomers"], 7043)
        self.assertIn("byGender", data)
        self.assertIn("byContract", data)
        self.assertIn("byPaymentMethod", data)
        self.assertIn("clvByTenure", data)

    def test_customer_segments_endpoint(self):
        """Verify GET /api/v1/analytics/segments returns 6 customer segments."""
        status, data = api_call("/api/v1/analytics/segments")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["segments"]), 6)
        segment_names = [s["name"] for s in data["segments"]]
        self.assertIn("High-Value", segment_names)
        self.assertIn("At-Risk", segment_names)
        self.assertIn("Lost", segment_names)

    def test_business_insights_endpoint(self):
        """Verify GET /api/v1/insights returns revenue at risk and strategic recommendations."""
        status, data = api_call("/api/v1/insights")
        self.assertEqual(status, 200)
        self.assertGreater(data["totalMrrAtRisk"], 50000)
        self.assertGreater(data["highRiskAccountsCount"], 500)
        self.assertGreater(len(data["keyDrivers"]), 0)
        self.assertGreater(len(data["opportunities"]), 0)


if __name__ == "__main__":
    unittest.main()
