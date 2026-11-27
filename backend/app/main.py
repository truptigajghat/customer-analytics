"""
ChurnIQ Backend Engine
======================
Production ASGI API service built with Starlette & Uvicorn:
- Native Python performance without unverified C-extension dependencies
- Full CORS support for React frontend (http://localhost:3000)
- Real-time ML inference with Scikit-Learn Random Forest champion model
- High-speed customer directory querying, sorting, and filtering
- Dynamic analytics, KPI generation, cohorts, and business insights
"""

import os
import uvicorn
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

from backend.app.services.analytics_service import analytics_service
from backend.app.services.customer_service import customer_service
from backend.app.services.ml_service import ml_service


async def health(request: Request) -> JSONResponse:
    return JSONResponse({
        "status": "healthy",
        "app": "ChurnIQ Backend",
        "version": "1.0.0",
        "engine": "Starlette/Uvicorn",
        "champion_model": "Random Forest v1.0",
    })


async def get_customers(request: Request) -> JSONResponse:
    params = request.query_params
    page = int(params.get("page", 1))
    page_size = int(params.get("page_size", 10))
    sort_by = params.get("sort_by", "tenure")
    sort_dir = params.get("sort_dir", "desc")
    search = params.get("search")
    gender = params.get("gender")
    contract = params.get("contract")
    payment_method = params.get("payment_method")
    internet_service = params.get("internet_service")
    status = params.get("status")
    tenure_range = params.get("tenure_range")
    segment = params.get("segment")

    result = customer_service.get_customers(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search,
        gender=gender,
        contract=contract,
        payment_method=payment_method,
        internet_service=internet_service,
        status=status,
        tenure_range=tenure_range,
        segment=segment,
    )
    return JSONResponse(result)


async def get_customer_by_id(request: Request) -> JSONResponse:
    customer_id = request.path_params["customerId"]
    customer = customer_service.get_customer(customer_id)
    if not customer:
        return JSONResponse(
            {"detail": f"Customer ID '{customer_id}' was not found in directory."},
            status_code=404,
        )
    return JSONResponse(customer)


async def predict_churn(request: Request) -> JSONResponse:
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            {"detail": "Invalid or empty JSON payload in request body."},
            status_code=400,
        )

    try:
        if not isinstance(body, dict):
            return JSONResponse(
                {"detail": "JSON body must be an object."},
                status_code=400,
            )
        customer_id = body.get("customer_id")
        if not customer_id or not str(customer_id).strip():
            return JSONResponse(
                {"detail": "Missing required field 'customer_id' in JSON payload."},
                status_code=400,
            )
        prediction = ml_service.predict_customer(str(customer_id).strip())
        return JSONResponse(prediction)
    except KeyError as e:
        msg = e.args[0] if e.args else str(e)
        return JSONResponse({"detail": msg}, status_code=404)
    except Exception as e:
        return JSONResponse({"detail": f"Inference error: {str(e)}"}, status_code=500)


async def get_model_performance(request: Request) -> JSONResponse:
    performance = ml_service.get_model_performance()
    return JSONResponse(performance)


async def get_analytics_overview(request: Request) -> JSONResponse:
    date_range = request.query_params.get("range", "12m")
    overview = analytics_service.get_dashboard_overview(date_range=date_range)
    return JSONResponse(overview)


async def get_customer_analytics(request: Request) -> JSONResponse:
    analytics = analytics_service.get_customer_analytics()
    return JSONResponse(analytics)


async def get_customer_segments(request: Request) -> JSONResponse:
    segments = analytics_service.get_customer_segments()
    return JSONResponse(segments)


async def get_business_insights(request: Request) -> JSONResponse:
    insights = analytics_service.get_business_insights()
    return JSONResponse(insights)


# Route Definitions
routes = [
    Route("/health", health, methods=["GET"]),
    Route("/api/v1/customers", get_customers, methods=["GET"]),
    Route("/api/v1/customers/{customerId}", get_customer_by_id, methods=["GET"]),
    Route("/api/v1/predict", predict_churn, methods=["POST"]),
    Route("/api/v1/models/performance", get_model_performance, methods=["GET"]),
    Route("/api/v1/analytics/overview", get_analytics_overview, methods=["GET"]),
    Route("/api/v1/analytics/customers", get_customer_analytics, methods=["GET"]),
    Route("/api/v1/analytics/segments", get_customer_segments, methods=["GET"]),
    Route("/api/v1/insights", get_business_insights, methods=["GET"]),
]

# Environment & Security Configuration
DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

# Middleware Configuration (CORS for React frontend)
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        allow_credentials=True,
    )
]

app = Starlette(debug=DEBUG, routes=routes, middleware=middleware)


if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False)
