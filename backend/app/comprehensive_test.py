import urllib.request
import json
import sys

def req(url, method='GET', data=None):
    try:
        r = urllib.request.Request(url, method=method)
        if data is not None:
            r.add_header('Content-Type', 'application/json')
            body = json.dumps(data).encode('utf-8')
        else:
            body = None
        with urllib.request.urlopen(r, data=body, timeout=5) as res:
            ct = res.headers.get('content-type', '')
            raw = res.read().decode('utf-8')
            if 'application/json' in ct:
                return res.status, json.loads(raw)
            return res.status, raw[:80]
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8')
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw
    except Exception as e:
        return 0, str(e)

tests = [
    # 1. Health
    ("1. Backend Health Check", "GET", "http://127.0.0.1:8000/health", None, 200),
    # 2. Customer Directory Pagination
    ("2. Customer Listing (Page 1, Size 5)", "GET", "http://127.0.0.1:8000/api/v1/customers?page=1&page_size=5", None, 200),
    # 3. Customer Search by ID
    ("3. Customer Search by ID", "GET", "http://127.0.0.1:8000/api/v1/customers?search=7590-VHVEG", None, 200),
    # 4. Customer Filter by Segment
    ("4. Customer Filter by Segment", "GET", "http://127.0.0.1:8000/api/v1/customers?segment=At-Risk&page_size=3", None, 200),
    # 5. Customer Detail by Exact ID
    ("5. Customer Detail (Exact ID: 7590-VHVEG)", "GET", "http://127.0.0.1:8000/api/v1/customers/7590-VHVEG", None, 200),
    # 6. Customer Detail by Normalized ID
    ("6. Customer Detail (CUST-7590 Resolution)", "GET", "http://127.0.0.1:8000/api/v1/customers/CUST-7590", None, 200),
    # 7. Customer Detail 404 Guard
    ("7. Customer 404 Guard (Invalid ID)", "GET", "http://127.0.0.1:8000/api/v1/customers/NON-EXISTENT-ID", None, 404),
    # 8. Live Prediction - High Risk Customer
    ("8. Live ML Prediction (7590-VHVEG)", "POST", "http://127.0.0.1:8000/api/v1/predict", {"customer_id": "7590-VHVEG"}, 200),
    # 9. Live Prediction - Low Risk Customer
    ("9. Live ML Prediction (5575-GNVDE)", "POST", "http://127.0.0.1:8000/api/v1/predict", {"customer_id": "5575-GNVDE"}, 200),
    # 10. Prediction 400 Bad Request Guard (Empty Body)
    ("10. Prediction 400 Guard (Empty Body)", "POST", "http://127.0.0.1:8000/api/v1/predict", {}, 400),
    # 11. Prediction 404 Guard (Nonexistent ID)
    ("11. Prediction 404 Guard (Invalid ID)", "POST", "http://127.0.0.1:8000/api/v1/predict", {"customer_id": "NON-EXISTENT-ID"}, 404),
    # 12. Model Performance Benchmarks
    ("12. Model Performance Benchmarks", "GET", "http://127.0.0.1:8000/api/v1/models/performance", None, 200),
    # 13. Analytics Overview KPIs
    ("13. Analytics Overview (KPIs & Trends)", "GET", "http://127.0.0.1:8000/api/v1/analytics/overview?range=12m", None, 200),
    # 14. Customer Analytics Distributions
    ("14. Customer Analytics Distributions", "GET", "http://127.0.0.1:8000/api/v1/analytics/customers", None, 200),
    # 15. Customer Segments Breakdown
    ("15. Customer Segments Breakdown", "GET", "http://127.0.0.1:8000/api/v1/analytics/segments", None, 200),
    # 16. Business Insights & Opportunities
    ("16. Business Insights & Opportunities", "GET", "http://127.0.0.1:8000/api/v1/insights", None, 200),
    # 17. Frontend Vite Dev Server
    ("17. Frontend React Vite Application", "GET", "http://127.0.0.1:3000/", None, 200),
]

print("================================================================================")
print("              CHURNQ COMPREHENSIVE END-TO-END AUDIT SUITE                       ")
print("================================================================================")
all_passed = True
for name, method, url, body, expected in tests:
    status, res = req(url, method, body)
    passed = (status == expected)
    if not passed:
        all_passed = False
    flag = "PASS" if passed else "FAIL"
    print(f"[{flag}] {name:<42} | Status: {status} (Expected: {expected})")
    if name.startswith("8. Live ML Prediction") and passed:
        print(f"       -> Churn Probability: {res.get('churnProbability')*100:.2f}% | Risk: {res.get('riskCategory')} | Factors: {len(res.get('contributingFactors', []))}")
    elif name.startswith("9. Live ML Prediction") and passed:
        print(f"       -> Churn Probability: {res.get('churnProbability')*100:.2f}% | Risk: {res.get('riskCategory')} | Model: {res.get('modelReference')}")
    elif name.startswith("12. Model Performance") and passed:
        rf = next(m for m in res['models'] if m['id'] == 'random_forest')
        print(f"       -> RF Accuracy: {rf['accuracy']*100:.2f}% | Recall: {rf['recall']*100:.2f}% | ROC-AUC: {rf['rocAuc']*100:.2f}% | Format in [0,1]: {rf['accuracy'] <= 1.0}")
    elif name.startswith("2. Customer Listing") and passed:
        print(f"       -> Total Database Records: {res.get('total')} | Current Page Items: {len(res.get('items', []))}")
    elif name.startswith("10. Prediction 400 Guard") and passed:
        print(f"       -> Detail caught: {res.get('detail')}")

print("================================================================================")
print(f"AUDIT SUITE VERDICT: {'ALL 17 TESTS PASSED - SYSTEM FULLY OPERATIONAL' if all_passed else 'TEST FAILURES DETECTED'}")
print("================================================================================")
