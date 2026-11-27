import urllib.request
import json

def test(url, method='GET', data=None):
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            body = json.dumps(data).encode('utf-8')
        else:
            body = None
        with urllib.request.urlopen(req, data=body, timeout=5) as response:
            content_type = response.headers.get('content-type', '')
            text = response.read().decode('utf-8')
            if 'application/json' in content_type:
                return response.status, json.loads(text)
            return response.status, text[:60]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

endpoints = [
    ('Backend Health', 'http://127.0.0.1:8000/health', 'GET', None, 200),
    ('Customers List', 'http://127.0.0.1:8000/api/v1/customers?page=1&page_size=3', 'GET', None, 200),
    ('Customer Detail', 'http://127.0.0.1:8000/api/v1/customers/7590-VHVEG', 'GET', None, 200),
    ('Live Prediction', 'http://127.0.0.1:8000/api/v1/predict', 'POST', {'customer_id': '7590-VHVEG'}, 200),
    ('Model Performance', 'http://127.0.0.1:8000/api/v1/models/performance', 'GET', None, 200),
    ('Analytics Overview', 'http://127.0.0.1:8000/api/v1/analytics/overview', 'GET', None, 200),
    ('Customer Analytics', 'http://127.0.0.1:8000/api/v1/analytics/customers', 'GET', None, 200),
    ('Segment Analytics', 'http://127.0.0.1:8000/api/v1/analytics/segments', 'GET', None, 200),
    ('Insights Playbooks', 'http://127.0.0.1:8000/api/v1/insights', 'GET', None, 200),
    ('Invalid ID 404 Guard', 'http://127.0.0.1:8000/api/v1/customers/INVALID-ID', 'GET', None, 404),
    ('Frontend Vite App', 'http://127.0.0.1:3000/', 'GET', None, 200)
]

print("=================== CHURNIQ ENDPOINTS VERIFICATION ===================")
all_passed = True
for name, url, method, payload, expected in endpoints:
    status, res = test(url, method, payload)
    passed = (status == expected)
    if not passed:
        all_passed = False
    flag = "PASS" if passed else "FAIL"
    print(f"[{flag}] {name:24} | Status: {status} (Expected: {expected})")
    if name == 'Backend Health' and passed:
        print(f"       Payload: {res}")
    elif name == 'Live Prediction' and passed:
        print(f"       Prediction: ChurnProb={res.get('churnProbability')}, RiskCategory={res.get('riskCategory')}, Factors={len(res.get('contributingFactors', []))}")
    elif name == 'Customers List' and passed:
        print(f"       Total Customers in DB: {res.get('total')}")

print("======================================================================")
print("OVERALL RESULT:", "ALL SERVICES HEALTHY & VERIFIED" if all_passed else "SOME SERVICES FAILED")
