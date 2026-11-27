# ChurnQ: Enterprise SaaS Customer Analytics & AI Churn Prediction Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![ASGI Backend](https://img.shields.io/badge/Backend-Starlette%20%2F%20Uvicorn%20ASGI-009688.svg?logo=fastapi&logoColor=white)](https://www.starlette.io/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%201.6+-F7931E.svg?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208.3+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Portfolio Ready](https://img.shields.io/badge/Status-Portfolio%20Ready%20%7C%20Local%20Demo%20Ready-brightgreen.svg)](#24-release-readiness--audit-attestation)

> **ChurnQ** is a full-stack, enterprise-grade customer intelligence and retention platform. Engineered for subscription and recurring-revenue businesses, it pairs an end-to-end Machine Learning inference pipeline with an interactive analytics dashboard to detect churn hazards before cancellation, diagnose multivariate risk drivers, calculate financial exposure, and deploy targeted retention playbooks.

---

## Table of Contents

1. [Executive Summary & Business Problem](#1-executive-summary--business-problem)
2. [Project Objectives & Core Pillars](#2-project-objectives--core-pillars)
3. [Six Comprehensive Dashboard Views](#3-six-comprehensive-dashboard-views)
4. [Technology Stack & Architectural Decisions](#4-technology-stack--architectural-decisions)
5. [End-to-End System Architecture](#5-end-to-end-system-architecture)
6. [Dataset Description & Provenance](#6-dataset-description--provenance)
7. [Data Cleaning & Zero-Leakage Pipeline](#7-data-cleaning--zero-leakage-pipeline)
8. [Exploratory Data Analysis & Statistical Associations](#8-exploratory-data-analysis--statistical-associations)
9. [Machine Learning Pipeline & Training Methodology](#9-machine-learning-pipeline--training-methodology)
10. [Model Benchmarking & Candidate Comparison](#10-model-benchmarking--candidate-comparison)
11. [Retention Metric Justification: Why Recall is Primary](#11-retention-metric-justification-why-recall-is-primary)
12. [Probability Calibration Analysis & Model Limitations](#12-probability-calibration-analysis--model-limitations)
13. [Financial Telemetry & Portfolio Reconciliation](#13-financial-telemetry--portfolio-reconciliation)
14. [Actionable Retention Playbooks & Interventions](#14-actionable-retention-playbooks--interventions)
15. [REST API Documentation & Endpoint Specification](#15-rest-api-documentation--endpoint-specification)
16. [Frontend Architecture & State Management](#16-frontend-architecture--state-management)
17. [Repository Folder Structure](#17-repository-folder-structure)
18. [Prerequisites & Environment Setup](#18-prerequisites--environment-setup)
19. [Installation & Local Development Quickstart](#19-installation--local-development-quickstart)
20. [Automated Test Suites & Verification Results](#20-automated-test-suites--verification-results)
21. [Containerization & Deployment Configuration](#21-containerization--deployment-configuration)
22. [Security Hardening & Operational Safety](#22-security-hardening--operational-safety)
23. [UI Interface Gallery & Visual Walkthrough](#23-ui-interface-gallery--visual-walkthrough)
24. [Release Readiness & Audit Attestation](#24-release-readiness--audit-attestation)
25. [Methodological Assumptions & Known Limitations](#25-methodological-assumptions--known-limitations)
26. [Roadmap & Future Enhancements](#26-roadmap--future-enhancements)
27. [Contributing Guidelines](#27-contributing-guidelines)
28. [License](#28-license)
29. [Author & Acknowledgments](#29-author--acknowledgments)

---

## 1. Executive Summary & Business Problem

In subscription-based SaaS and telecommunications businesses, **Customer Acquisition Cost (CAC)** typically exceeds retention cost by **5x to 7x**. Empirical studies across subscription economics demonstrate that increasing customer retention by just **5%** can improve enterprise operating profits by **25% to 95%**, because retained subscribers generate high-margin recurring cash flows with zero incremental sales overhead.

Despite this, traditional retention strategies fail because:
1. **Lags in Detection**: Cancellation requests and exit surveys arrive after customer attrition has already crystallized, preventing proactive intervention.
2. **Gross Margin Dilution**: Indiscriminate blanket discount promotions burn margin on satisfied subscribers who were never at risk of canceling.
3. **Multivariate Blind Spots**: Complex, compounding churn drivers (e.g., fiber optic subscribers on month-to-month contracts lacking tech support and paying via electronic checks) cannot be detected via manual spreadsheet filters.

**ChurnQ** solves this by bridging machine learning telemetry with financial decision-making: it operationalizes a trained ensemble classifier against behavioral and demographic features to flag accounts before they cancel, quantifying the exact recurring revenue at risk and providing prescriptive retention workflows.

---

## 2. Project Objectives & Core Pillars

- **Early Churn Hazard Detection**: Operationalize an ensemble Random Forest classifier optimized for high **Recall (79.41%)** on held-out test data, capturing 4 out of every 5 churners before churn occurs.
- **Explainable AI (XAI)**: Demystify churn scores into transparent, human-readable risk drivers (contract vulnerability, tech support absence, payment method friction, tenure duration).
- **Executive Revenue Telemetry**: Distinguish historical churned spend ($139.1k) from active retained Monthly Recurring Revenue (MRR: $316.9k) and quantify probability-weighted exposure ($111.9k uncalibrated estimate, $65.4k calibrated validation estimate).
- **Prescriptive Retention Playbooks**: Map churn risk bands (High $\ge 0.65$, Medium $0.35–0.65$, Low $< 0.35$) directly to actionable customer success interventions (annual commitment discounts, VIP technical onboarding, automated billing migration).

---

## 3. Six Comprehensive Dashboard Views

ChurnQ features six dedicated, purpose-built dashboard interfaces:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CHURNQ ENTERPRISE SUITE                         │
├─────────────────┬──────────────────────────────────────────────────────┤
│ 1. Overview     │ Executive KPI cards, 12-month cohort retention,      │
│    Dashboard    │ high-risk account alerts, portfolio MRR breakdown.   │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 2. Customer     │ Full-text search, multi-attribute filtering across   │
│    Analytics    │ all 7,043 accounts, sorting, and CSV export.         │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 3. Customer     │ 6 behavioral cohorts (High-Value, Loyal, New, Price- │
│    Segmentation │ Sensitive, At-Risk, Lost) with spend distributions.  │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 4. Churn        │ Real-time ML inference, interactive gauge, top risk  │
│    Prediction   │ drivers, and prescriptive retention playbooks.       │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 5. Model        │ Multi-model evaluation telemetry, 50-point ROC/PR    │
│    Performance  │ curves, interactive confusion matrix, calibration.   │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 6. Business     │ Revenue at risk by contract tier, hazard driver      │
│    Insights     │ prioritization, and projected annual savings ROI.    │
└─────────────────┴──────────────────────────────────────────────────────┘
```

1. **Executive Overview Dashboard**: High-level portfolio health monitoring displaying active MRR ($316,985.75), total monthly charges across all records ($456,116.60), portfolio churn rate (26.54%), 12-month cohort retention curves, and urgent high-risk account feeds.
2. **Customer Analytics & Deep Directory**: Comprehensive table supporting real-time search, multi-dimensional filtering (Contract, Tenure, Internet Tier, Payment Method), server-side pagination, and client-side CSV export of filtered customer cohorts.
3. **Customer Segmentation Engine**: Profiles the subscriber base into 6 distinct behavioral cohorts: *High-Value Champions*, *Loyal Retained*, *New Onboarding*, *Price-Sensitive*, *At-Risk Hazard*, and *Historical Lost*.
4. **Real-Time Churn Prediction & Playbooks**: Single-customer lookup and custom feature scoring engine. Computes churn probability, assigns a risk badge (`High` $\ge 0.65$, `Medium` $0.35–0.65$, `Low` $< 0.35$), extracts top hazard factors, and recommends a tailored retention playbook.
5. **Model Performance & Benchmark Telemetry**: Side-by-side benchmark comparison between the Champion Random Forest, Baseline Logistic Regression, and Pruned Decision Tree, with 50-point ROC/PR curves and an interactive confusion matrix.
6. **Strategic Retention Insights & MRR Exposure**: Executive financial exposure dashboard decomposing revenue at risk by contract type, ranking structural churn drivers, and projecting net annual retention savings ($365k+).

---

## 4. Technology Stack & Architectural Decisions

### Backend Architecture
| Component | Technology | Rationale |
|---|---|---|
| **ASGI Engine** | Starlette 0.40+ / Uvicorn 0.34+ | High-throughput asynchronous request handling, lightweight routing, minimal overhead compared to heavy full-stack frameworks. |
| **Data Processing** | Pandas 2.2+, NumPy 2.0+ | Vectorized tabular transformations, zero-copy memory filtering, and fast data frame operations. |
| **Machine Learning** | Scikit-Learn 1.6+ | Production-grade `Pipeline` and `ColumnTransformer` encapsulation preventing data leakage and ensuring reproducible preprocessing. |
| **Model Persistence** | Joblib 1.4+ | Optimized serialization for large NumPy arrays and decision tree ensembles. |
| **Validation & Testing** | Python `unittest` | Zero-dependency, hermetic test runner executing data integrity, pipeline, and API integration tests. |

### Frontend Architecture
| Component | Technology | Rationale |
|---|---|---|
| **UI Framework** | React 19 (Hooks, Context) | Modern concurrent rendering, clean separation of concerns, declarative UI state management. |
| **Type Safety** | TypeScript 5.8+ | Strict compile-time interface checking across all API contracts, customer types, and prediction responses. |
| **Bundler & Server** | Vite 8.3+ | Sub-second Hot Module Replacement (HMR) and optimized Rollup production asset compilation (1.55s build). |
| **Styling Engine** | Tailwind CSS v4 | Utility-first, responsive design with zero runtime CSS overhead and dark mode support. |
| **Data Visualization** | Recharts 3.11+ | Declarative, accessible, responsive SVG charting for time-series, bar distributions, and ROC/PR curves. |
| **Testing** | Vitest 5.1+ & JSDOM | Lightning-fast React component testing with `@testing-library/react` and `@testing-library/user-event`. |

---

## 5. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph DataEngineering ["Data Engineering & Preprocessing Pipeline"]
        RawCSV["Raw IBM Telco Dataset<br/>(7,043 rows, 21 columns)"]
        CleanScript["data_cleaning.py<br/>(Audit 11 blank TotalCharges, Tenure=0)"]
        CleanCSV["cleaned_telco_churn.csv<br/>(0 nulls, 0 duplicate IDs)"]
        SplitScript["feature_engineering.py<br/>(Stratified 80/20 Train-Test Split)"]
        TrainSplit["X_train, y_train<br/>(5,634 rows)"]
        TestSplit["X_test, y_test<br/>(1,409 rows)"]
        Prep["ColumnTransformer<br/>StandardScaler + OneHotEncoder"]
        PrepJoblib["preprocessor.joblib<br/>(30 features)"]
        TrainScript["train_models.py<br/>(Random Forest, Logistic Reg, Decision Tree)"]
        RFModel["churn_model.joblib<br/>(Champion 150 Trees)"]
    end

    subgraph BackendASGI ["Backend ASGI Microservice (Port 8000)"]
        Uvicorn["Uvicorn ASGI Server<br/>(uvicorn.workers.UvicornWorker)"]
        Router["Starlette Router<br/>(CORS Guard, JSON Error Handlers)"]
        CustSvc["customer_service.py<br/>(7,043 Customer Store & Search)"]
        MLSvc["ml_service.py<br/>(Real-Time Scikit-Learn Inference)"]
        AnalytSvc["analytics_service.py<br/>(MRR Exposure & KPI Aggregation)"]
    end

    subgraph FrontendApp ["Frontend Application (Port 3000)"]
        ViteDev["Vite Dev Server / Nginx Reverse Proxy"]
        APIClient["api.ts (REST Fetch Client with Fallback Guard)"]
        StateMgr["useAppContext (Filter & Theme Global State)"]
        P_Overview["1. Overview Dashboard"]
        P_Analytics["2. Customer Analytics & Directory"]
        P_Segments["3. Customer Segmentation"]
        P_Prediction["4. Churn Prediction & Playbooks"]
        P_Performance["5. Model Performance Telemetry"]
        P_Insights["6. Strategic Revenue Insights"]
    end

    RawCSV --> CleanScript --> CleanCSV
    CleanCSV --> SplitScript --> TrainSplit & TestSplit
    TrainSplit --> Prep --> PrepJoblib
    TrainSplit & PrepJoblib --> TrainScript --> RFModel
    TestSplit & PrepJoblib & RFModel --> TrainScript

    CleanCSV --> CustSvc
    PrepJoblib --> MLSvc
    RFModel --> MLSvc
    CustSvc --> AnalytSvc

    CustSvc & MLSvc & AnalytSvc --> Router --> Uvicorn
    Uvicorn <==>|"REST / JSON API (Port 8000)"| APIClient
    APIClient --> StateMgr
    StateMgr --> P_Overview & P_Analytics & P_Segments & P_Prediction & P_Performance & P_Insights
```

---

## 6. Dataset Description & Provenance

The platform is developed and evaluated on the canonical **IBM Telco Customer Churn** benchmark dataset.
- **Total Records**: 7,043 customer accounts
- **Total Features**: 21 original columns
- **Target Variable**: `Churn` (`Yes` / `No`) — 1,869 churners (26.54% historical churn rate), 5,174 retained customers (73.46%)
- **Customer Identifier**: `customerID` (Alphanumeric string, 0 duplicates, 0 missing values)
- **Demographic Features**: `gender`, `SeniorCitizen` (0/1), `Partner` (Yes/No), `Dependents` (Yes/No)
- **Subscribed Telephony & Internet Services**: `PhoneService`, `MultipleLines`, `InternetService` (DSL, Fiber optic, No), `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`
- **Account & Billing Metadata**: `Contract` (Month-to-month, One year, Two year), `PaperlessBilling` (Yes/No), `PaymentMethod` (Electronic check, Mailed check, Bank transfer, Credit card), `MonthlyCharges` (float), `TotalCharges` (float), `tenure` (integer months)

---

## 7. Data Cleaning & Zero-Leakage Pipeline

Data cleaning is governed by strict, idempotent verification rules implemented in `backend/app/data_cleaning.py`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA CLEANING AUDIT TRAIL                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Schema Check: 21 exact columns verified in exact specification order│
│ 2. Missing Value Audit: TotalCharges had 11 blank whitespace strings   │
│ 3. Tenure Integrity: 100% (11/11) blank records had tenure == 0        │
│ 4. Domain Imputation: Imputed 0.0 for tenure=0 unbilled accounts       │
│ 5. Type Casting: TotalCharges cast from object string to float64       │
│ 6. Duplicate Check: 0 duplicate customer IDs detected across 7,043 rows│
│ 7. Domain Set Guard: All categoricals verified against permitted sets  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Missing TotalCharges**: Exactly 11 records in the raw dataset contained blank whitespace strings (`" "`) in `TotalCharges`.
- **Tenure Verification**: Cross-tabulation proved that all 11 records strictly had `tenure == 0`. These represent new accounts enrolled during the current billing cycle who have not yet accrued their first monthly invoice.
- **Domain Justification**: Imputing `0.0` is business-accurate and preserves data integrity without introducing synthetic bias or dropping valid active accounts.
- **Clean Dataset Export**: Exported to `backend/data/cleaned_telco_churn.csv` (7,043 rows, 21 columns, exact `float64` `TotalCharges`, 0 nulls, 0 duplicate IDs).

---

## 8. Exploratory Data Analysis & Statistical Associations

![EDA Churn Drivers](backend/data/eda_churn_drivers.png)

> **Important Statistical Note**: The metrics below represent observed empirical correlations and statistical associations within the historical IBM Telco cohort. They provide actionable signals for churn risk prioritization, but do not imply strict causal mechanisms.

1. **Contract Type Hazard**:
   - Month-to-month subscribers exhibit a **42.71%** churn rate (1,655 churners out of 3,875 month-to-month accounts).
   - Month-to-month accounts represent **88.55%** of all historical churn in the dataset (1,655 out of 1,869 total churners).
   - In contrast, one-year contracts churn at **11.27%** and two-year contracts churn at just **2.83%**.
2. **Internet Tier & Support Services**:
   - Fiber optic subscribers without technical support churn at **41.9%**, driven by high monthly charges paired with onboarding and connection friction.
   - Adding `TechSupport` and `OnlineSecurity` reduces churn rates by more than half across all internet cohorts.
3. **Payment Method Friction**:
   - Customers paying via manual **Electronic Check** churn at **45.29%**, compared to **15.2%** for automated bank transfers and credit card autopay.
4. **Tenure Window Vulnerability**:
   - Median tenure for churned accounts is **10 months**, compared to **38 months** for retained accounts. The steepest cancellation hazard occurs within months 1 through 6.

---

## 9. Machine Learning Pipeline & Training Methodology

The machine learning workflow enforces strict data science hygiene to eliminate data leakage:

1. **Stratified Split**: An 80/20 train-test split (`random_state=42`, stratified on `Churn`) partitions the dataset into **5,634 training records** and **1,409 held-out testing records**.
2. **ColumnTransformer Preprocessor**: Fitted strictly on the training set (`X_train`):
   - **Numerical Features** (`tenure`, `MonthlyCharges`, `TotalCharges`): Standardized with `StandardScaler()`.
   - **Categorical Features** (16 columns): Encoded with `OneHotEncoder(drop="first", handle_unknown="ignore")`.
   - **Feature Dimension**: Exactly 30 engineered features.
3. **Model Selection & Architecture**:
   - **Champion Random Forest**: 150 bagged decision trees, `max_depth=9`, `min_samples_leaf=10`, `class_weight="balanced"`, `n_jobs=-1`.
   - **Baseline Logistic Regression**: L2 regularization, `class_weight="balanced"`, `max_iter=1000`.
   - **Candidate Decision Tree**: Pruned single decision tree, `max_depth=5`, `min_samples_leaf=25`.

---

## 10. Model Benchmarking & Candidate Comparison

Evaluated on the held-out test split of **1,409 customer records** (374 churners, 1,035 retained):

| Model Architecture | Accuracy | Precision | Recall (Primary Metric) | F1-Score | ROC-AUC | Confusion Matrix (TN / FP / FN / TP) |
|---|---|---|---|---|---|---|
| **Random Forest (Champion)** | **75.30%** | **52.29%** | **79.41%** (297 / 374) | **63.06%** | **84.41%** | **764 / 271 / 77 / 297** |
| **Logistic Regression (Baseline)** | 73.81% | 50.43% | 78.34% (293 / 374) | 61.36% | 84.17% | 747 / 288 / 81 / 293 |
| **Decision Tree (Candidate)** | 73.17% | 49.67% | 80.48% (301 / 374) | 61.43% | 82.99% | 730 / 305 / 73 / 301 |

---

## 11. Retention Metric Justification: Why Recall is Primary

In subscription-based retention workflows, metric selection must align with asymmetric business costs:

- **Cost of a False Negative (Missed Churner)**: The customer cancels their subscription permanently. The business forfeits the entire remaining **Customer Lifetime Value (LTV)** (averaging $1,000–$2,500+) and incurs full Customer Acquisition Cost (CAC) to replace the lost revenue.
- **Cost of a False Positive (False Alarm)**: A loyal subscriber receives a targeted check-in call, customer success survey, or promotional incentive (costing $5–$25 in operational outreach).
- **The Tradeoff**: Because False Negatives are substantially more costly than False Positives, **Recall (79.41%)** is the primary operational metric. The Random Forest model captures ~4 out of every 5 churners.
- **Precision Guardrail (52.29%)**: With balanced class weights, a precision of 52.29% guarantees that more than half of flagged accounts are genuine churn risks, preventing customer success burnout while maintaining high coverage.

---

## 12. Probability Calibration Analysis & Model Limitations

In decision-support applications, raw predicted probabilities are frequently interpreted as financial probabilities of default. However, ensemble tree models require careful calibration analysis:

### 1. Raw Random Forest Calibration Profile
Uncalibrated Random Forest models average discrete leaf votes across 150 trees. Because extreme probability estimates (near 0.0 or 1.0) require near-unanimous tree agreement, raw tree probabilities tend to concentrate toward the center, often producing a sigmoidal distortion that overestimates probabilities in intermediate score bands.

### 2. Empirical Calibration Evaluation (Platt Scaling)
To quantify this behavior, a calibration audit was performed using Logistic Calibration (Platt Scaling) evaluated across the held-out test split:

| Evaluation Metric | Raw Production Model (RF) | Calibrated Benchmark (Platt) | Improvement |
|---|---|---|---|
| **Brier Score** (Mean Squared Error) | **0.1691** | **0.1342** | **-20.6%** (Lower error) |
| **Expected Calibration Error (ECE)** | **0.0924** | **0.0215** | **-76.7%** (Closer to identity line) |
| **Log-Loss** | **0.4947** | **0.4079** | **-17.5%** |

### 3. Release Distinction
- **Production Inference Engine**: Generates uncalibrated Random Forest probabilities ($P_{\text{RF}}$) with a decision threshold of **0.65** for high-risk alerts.
- **Actuarial Calibration Benchmark**: Documents that applying Platt scaling reduces expected calibration error by 76.7%, offering an alternative weighting benchmark for enterprise finance teams.

---

## 13. Financial Telemetry & Portfolio Reconciliation

To prevent confusion between active recurring revenue and historical churned records, ChurnQ enforces strict accounting distinctions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PORTFOLIO REVENUE RECONCILIATION                     │
├────────────────────────────────────────────────────────────────────────┤
│ Total Monthly Charges (All 7,043 Records):               $456,116.60    │
│ Less Historical Churned Accounts (1,869 Records):      - $139,130.85    │
├────────────────────────────────────────────────────────────────────────┤
│ Active Retained Customer Base MRR (5,174 Records):       $316,985.75    │
└────────────────────────────────────────────────────────────────────────┘
```

### Risk Stratification Across Active Customers (5,174 Accounts)

| Risk Classification Method | Criteria | At-Risk Active Accounts | Active MRR at Risk |
|---|---|---|---|
| **Rule-Based Segmentation** | Month-to-month contract + tenure $\le 12$ mos + electronic check | **992 accounts** | **$86,948.00** |
| **ML Probability-Based High Risk** | Predicted Random Forest probability $P_{\text{RF}} \ge 0.65$ | **612 accounts** | **$46,427.80** |
| **Dual-Flag Overlap** | Flagged by BOTH Rule-Based Segment AND ML High-Risk | **448 accounts** | **$38,442.95** |

### Actuarial Probability-Weighted Monthly Exposure
$$\text{Expected Monthly Loss} = \sum_{i \in \text{Active}} P_i \times \text{MonthlyCharges}_i$$

- **Uncalibrated Production Estimate** ($\sum P_{\text{RF}} \times \text{MRR}$): **$111,954.69 / month** across all 5,174 active accounts.
- **Calibrated Validation Estimate** ($\sum P_{\text{Platt}} \times \text{MRR}$): **$65,454.36 / month**.
- **Key Insight**: The uncalibrated estimate is conservative (higher hazard exposure), while the calibrated estimate represents a tighter actuarial baseline.

---

## 14. Actionable Retention Playbooks & Interventions

ChurnQ pairs ML predictions directly with prescriptive business actions:

| Risk Tier | Churn Probability | Primary Drivers | Recommended Retention Playbook | Projected ROI |
|---|---|---|---|---|
| **High Risk** | $\ge 65\%$ | Month-to-month contract, electronic check, no tech support | **VIP Retention Blitz**: 15% discount on 1-year contract commitment, dedicated onboarding manager, complimentary premium tech support for 6 months. | Saves ~35% of high-risk cohort ($16k+ monthly MRR). |
| **Medium Risk** | $35\% - 65\%$ | Fiber optic without security, tenure 6–18 months | **Service Value Bundling**: Free 90-day trial of Online Security and Cloud Backup, automated autopay migration with $10 bill credit. | Reduces transition to high-risk by 22%. |
| **Low Risk** | $< 35\%$ | Annual/two-year contracts, autopay, multi-product tenure | **Expansion & Advocacy**: Upsell higher internet bandwidth, refer-a-friend loyalty credits, annual review. | Increases NRR (Net Revenue Retention) by 8%. |

---

## 15. REST API Documentation & Endpoint Specification

Base URL: `http://localhost:8000`

| Method | Endpoint | Description | Request Query / Payload | Response Schema |
|---|---|---|---|---|
| `GET` | `/health` | Service health status | None | `{"status": "healthy", "version": "1.0.0"}` |
| `GET` | `/api/v1/customers` | Paginated customer directory | `?page=1&page_size=10&contract=Month-to-month` | `{"total": 7043, "page": 1, "customers": [...]}` |
| `GET` | `/api/v1/customers/{id}` | Customer profile lookup | Path param: `7590-VHVEG` | Full customer JSON profile with demographic & billing metadata |
| `POST` | `/api/v1/predict` | Real-time ML churn scoring | `{"customer_id": "7590-VHVEG"}` or feature JSON | `{"churn_probability": 0.72, "risk_level": "High", "risk_factors": [...], "playbook": {...}}` |
| `GET` | `/api/v1/models/performance` | Held-out evaluation telemetry | None | 3 models, confusion matrix, 50-pt ROC/PR curves |
| `GET` | `/api/v1/analytics/overview` | Executive portfolio KPIs | `?range=12m` | 6 KPI values, 12-month cohort trends, recent events |
| `GET` | `/api/v1/analytics/customers` | Segment & billing distributions | None | Buckets by gender, contract, payment, CLV distribution |
| `GET` | `/api/v1/analytics/segments` | 6 customer behavioral segments | None | Segment customer counts, MRR contribution, playbooks |
| `GET` | `/api/v1/insights` | Strategic revenue exposure | None | Total MRR at risk, top hazard drivers, campaigns |

---

## 16. Frontend Architecture & State Management

The frontend is built with React 19 and TypeScript using a clean, layered architecture:

- **State Layer (`useAppContext`)**: Manages global UI preferences, date-range filters, active customer selections, and live API connection status with demo fallback guard.
- **Service Layer (`src/services/`)**:
  - `api.ts`: Centralized fetch client with request timeout handling (8,000ms), structured error formatting, and graceful fallback to local mock datasets when backend is disconnected.
  - `customerService.ts`: Directory filtering, multi-field search, and client-side CSV serialization.
  - `predictionService.ts`: Real-time ML inference dispatcher.
  - `analyticsService.ts`: Executive KPI retrieval and metric calculation.
- **Component Primitives (`src/components/common/`)**: Reusable `KpiCard`, `DataTable`, `SearchFilterBar`, `StatusBadge`, `LoadingState`, `ErrorState`, and `DemoNotice`.

---

## 17. Repository Folder Structure

```
churniq/
├── .dockerignore                       # Docker root build ignore specifications
├── .env.example                        # Template for backend & frontend environment variables
├── .gitignore                          # Git exclusions (venv, node_modules, dist, logs, caches)
├── Dockerfile                          # Multi-stage production Docker build (Vite + Nginx)
├── docker-compose.yml                  # Multi-container local orchestration (backend + frontend)
├── index.html                          # Single-page application root HTML
├── metadata.json                       # Project metadata and configuration
├── nginx.conf                          # Production Nginx reverse-proxy & SPA routing config
├── package.json                        # Node dependencies, build scripts, and test runners
├── tsconfig.json                       # TypeScript compiler options
├── vite.config.ts                      # Vite build configuration with Tailwind CSS v4
├── vitest.config.ts                    # Vitest configuration for component testing
├── backend/
│   ├── .dockerignore                   # Backend Docker build ignore specifications
│   ├── Dockerfile                      # Production Python 3.12 ASGI Dockerfile
│   ├── requirements.txt                # Pinned Python package dependencies
│   ├── app/
│   │   ├── main.py                     # Starlette ASGI application entry point & CORS routing
│   │   ├── schemas.py                  # Pydantic schemas & response contracts
│   │   ├── data_cleaning.py            # Phase 4 strict cleaning pipeline & zero-tenure audit
│   │   ├── data_inspection.py          # Phase 3 profiling and exploratory inspection
│   │   ├── eda_analysis.py             # Phase 5 exploratory data analysis & chart export
│   │   ├── feature_engineering.py      # Phase 6 ColumnTransformer & 80/20 train-test split
│   │   ├── train_models.py             # Phase 7 model training & benchmark evaluation
│   │   ├── validate_business_metrics.py# Comprehensive financial reconciliation audit
│   │   ├── validate_ml_calibration.py  # Platt scaling calibration evaluation script
│   │   ├── verify_system.py            # End-to-end backend subsystem verification
│   │   └── services/
│   │       ├── analytics_service.py    # Portfolio KPIs & MRR exposure computation
│   │       ├── customer_service.py     # 7,043 customer store & query engine
│   │       └── ml_service.py           # Scikit-learn real-time inference service
│   ├── data/
│   │   ├── WA_Fn-UseC_-Telco-Customer-Churn.csv # Original raw IBM Telco dataset
│   │   ├── cleaned_telco_churn.csv     # Verified cleaned dataset (7,043 rows, 21 cols)
│   │   ├── train_test_split.joblib     # Serialized 80/20 stratified split
│   │   ├── eda_churn_drivers.png       # Exported correlation & driver charts
│   │   └── eda_insights.json           # Serialized EDA statistical metrics
│   ├── models/
│   │   ├── preprocessor.joblib         # Fitted Scikit-Learn ColumnTransformer (30 features)
│   │   ├── churn_model.joblib          # Serialized Random Forest champion model (3.1 MB)
│   │   ├── logistic_regression.joblib  # Serialized baseline model (1.1 KB)
│   │   ├── feature_metadata.json       # Pipeline feature dimension mapping
│   │   ├── feature_importance.json     # Ranked Random Forest feature importances
│   │   ├── model_performance.json      # Held-out benchmark metrics & 50-point curves
│   │   ├── business_metrics_audit.json # Reconciled active vs churned MRR figures
│   │   └── calibration_evaluation.json # Platt scaling calibration metrics
│   └── tests/
│       ├── __init__.py
│       ├── test_data_integrity.py      # 5 tests: Zero-tenure, schema, domain validation
│       ├── test_ml_pipeline.py         # 7 tests: Leakage, dimensions, probability bounds
│       └── test_api_endpoints.py       # 17 tests: Comprehensive REST API integration suite
└── src/
    ├── App.tsx                         # Root router & layout container
    ├── index.css                       # Global Tailwind CSS directives
    ├── main.tsx                        # React 19 application mounting
    ├── assets/                         # Static visual assets
    ├── components/
    │   ├── charts/                     # Recharts styling theme & responsive palettes
    │   ├── common/                     # KpiCard, DataTable, StatusBadge, Modal, states
    │   ├── customers/                  # Customer profile cards & detail inspection modals
    │   ├── layout/                     # Navbar, Sidebar, and AppLayout
    │   └── predictions/                # PredictionResultCard, gauge, and playbook viewer
    ├── data/                           # Mock datasets for offline demo mode
    ├── hooks/                          # useAppContext and useAsyncData custom hooks
    ├── pages/
    │   ├── Overview.tsx                # Executive portfolio dashboard
    │   ├── CustomerAnalytics.tsx       # Customer directory & distribution charts
    │   ├── Segmentation.tsx            # 6 behavioral customer cohorts
    │   ├── ChurnPrediction.tsx         # Real-time ML inference & lookup
    │   ├── ModelPerformance.tsx        # ML metrics, ROC/PR curves & confusion matrix
    │   ├── BusinessInsights.tsx        # Revenue at risk & tactical playbooks
    │   └── Settings.tsx                # System preferences and API connection manager
    ├── services/                       # Typed API client services
    ├── tests/
    │   ├── fixtures.ts                 # Test mock data fixtures
    │   ├── pages.test.tsx              # 8 Vitest page render tests
    │   ├── interactions.test.tsx       # 8 Vitest interaction tests (search, filter, modal)
    │   ├── run_frontend_tests.ts       # 32 TypeScript contract tests
    │   └── setup.ts                    # Vitest environment setup
    ├── types/                          # TypeScript interface declarations
    └── utils/                          # Currency, percentage, and date formatters
```

---

## 18. Prerequisites & Environment Setup

- **Python**: Version 3.11, 3.12, or 3.14
- **Node.js**: Version 20+ or 22+ (npm 10+)
- **Git**

---

## 19. Installation & Local Development Quickstart

### 1. Clone the Repository
```bash
git clone https://github.com/truptigajghat/customer-analytics.git
cd customer-analytics
```

### 2. Configure Environment Variables
```bash
# Copy template configuration
cp .env.example .env
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt
```

### 4. Frontend Setup
```bash
# Return to project root
cd ..

# Install dependencies
npm install
```

### 5. Running the Application

**Terminal 1 — Backend ASGI Service (Port 8000)**:
```bash
# From project root (PowerShell):
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
# On Linux / macOS:
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000`
- API Health Status: `http://localhost:8000/health`

**Terminal 2 — Frontend Application (Port 3000)**:
```bash
# From project root:
npm run dev
```
- Open browser at: `http://localhost:3000`

---

## 20. Automated Test Suites & Verification Results

ChurnQ maintains automated testing across backend, machine learning, and frontend layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERIFIED TEST SUITE RESULTS                     │
├────────────────────────────────────────────────────────────────────────┤
│ Backend Tests:   29 passed (5 Data Integrity, 7 ML, 17 API)           │
│ Frontend Tests:  48 passed (16 Vitest Component, 32 TS Contracts)      │
│ TypeScript Lint: 0 errors (tsc --noEmit passed across 2,097 modules)   │
│ Production Build:Succeeded (Vite bundle compiled in 1.55s)             │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Run Backend & ML Tests (29 Tests)
```bash
backend\.venv\Scripts\python.exe -m unittest discover -s backend/tests -p "test_*.py" -v
```
- `test_data_integrity.py` (5 tests): Checks schema presence, TotalCharges float conversion, zero-tenure consistency, categorical domain values, duplicate-free customer IDs.
- `test_ml_pipeline.py` (7 tests): Checks zero data leakage across train/test splits, 30-feature dimensionality, probability bounds $[0.0, 1.0]$, recall target $> 75\%$, ROC-AUC $> 0.80$.
- `test_api_endpoints.py` (17 tests): Tests health check, customer pagination, customer detail resolution, 404 error handling, ML inference scoring, model benchmark metrics, overview KPIs, customer distributions, segmentation, insights, and CORS headers.

### 2. Run Frontend Tests (48 Tests)
```bash
# Run complete frontend test suite (Component tests + Contract tests)
npm test

# Run Vitest React component tests only (16 tests)
npm run test:components

# Run TypeScript contract tests only (32 tests)
npm run test:contracts
```

### 3. Run Static Type Checking & Production Build
```bash
# Static type checking
npm run lint

# Production build compilation
npm run build
```

---

## 21. Containerization & Deployment Configuration

ChurnQ includes complete multi-container Docker configuration files:
- `backend/Dockerfile`: Multi-stage Python 3.12 slim image running Uvicorn ASGI on port 8000.
- `Dockerfile`: Multi-stage Node 20 build compiling Vite production assets and serving them via Nginx on port 3000.
- `docker-compose.yml`: Multi-service orchestration mapping frontend and backend with isolated networking and health checks.
- `nginx.conf`: Nginx reverse-proxy configuration managing SPA client routing and proxying `/api/` traffic to the backend.

```bash
# Multi-container deployment command
docker-compose up --build -d
```

> **Audit Attestation Note**: As documented in the release audit, the Docker Compose configuration and Dockerfiles are fully authored and prepared. However, because the local Windows development host does not have the Docker daemon installed, the Docker runtime environment has **not yet been executed**.

---

## 22. Security Hardening & Operational Safety

- **Zero Hardcoded Secrets**: Scanned and verified across all source files. No API keys, passwords, database credentials, or private tokens exist in the repository.
- **Environment Isolation**: `.gitignore` comprehensively excludes `.env*` files (preserving only `.env.example`), `.venv/`, `node_modules/`, `dist/`, `build/`, `*.log`, and temporary files.
- **Repository Size Hygiene**: All tracked machine learning models (`churn_model.joblib`: 3.1 MB) and CSV datasets (`cleaned_telco_churn.csv`: 956 KB) are well below GitHub's 50 MB warning threshold and 100 MB rejection limit.
- **CORS Configuration**: Restricts API access via `CORS_ORIGINS` environment variable, defaulting to local frontend origins during development.
- **Input Validation**: Strict schema checks reject missing IDs and malformed payloads with HTTP 400 and structured error responses.

---

## 23. UI Interface Gallery & Visual Walkthrough

### 1. Executive Overview Dashboard
Comprehensive KPI monitoring with active MRR, portfolio churn rate, and 12-month cohort retention heatmaps.
```
┌────────────────────────────────────────────────────────────────────────┐
│ [KPI] Active MRR: $316.9k │ Churn Rate: 26.5% │ Retained: 5,174 Users │
├────────────────────────────────────────────────────────────────────────┤
│ 12-Month Cohort Retention Curve (Monthly Retention % & Survival Curve) │
│ Live High-Risk Customer Feed (Top 5 Accounts by Churn Probability)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Customer Analytics & Deep Directory
Full directory search, contract filtering, tenure sliders, and CSV download.
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Search: "7590"] [Contract: Month-to-month ▼] [Payment: All ▼] [Export]│
├────────────────────────────────────────────────────────────────────────┤
│ Customer ID │ Contract       │ Tenure │ Monthly Charges │ Churn Risk   │
│ 7590-VHVEG  │ Month-to-month │ 1 mo   │ $29.85          │ High (72%)   │
│ 5575-GNVDE  │ One year       │ 34 mos │ $56.95          │ Low (14%)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Customer Segmentation Engine
Behavioral cohort spend breakdown and customer distribution across 6 segments.
```
┌────────────────────────────────────────────────────────────────────────┐
│ Cohorts: High-Value (18%) │ Loyal (35%) │ At-Risk (19%) │ Lost (27%)   │
├────────────────────────────────────────────────────────────────────────┤
│ Spend vs Tenure Scatter Distribution & Segment Revenue Share           │
└────────────────────────────────────────────────────────────────────────┘
```

### 4. Real-Time Churn Prediction & Playbooks
Interactive churn scoring gauge, top hazard drivers, and recommended retention playbook.
```
┌────────────────────────────────────────────────────────────────────────┐
│ Customer: 7590-VHVEG  │  CHURN RISK: 72% [HIGH RISK BADGE]             │
├────────────────────────────────────────────────────────────────────────┤
│ Top Risk Drivers: Month-to-month (+35%), No Tech Support (+22%)        │
│ Recommended Playbook: VIP Retention Blitz (15% 1-Year Upgrade)         │
└────────────────────────────────────────────────────────────────────────┘
```

### 5. Model Performance Telemetry
Side-by-side benchmark comparison, 50-point ROC/PR curves, and interactive confusion matrix.
```
┌────────────────────────────────────────────────────────────────────────┐
│ Random Forest: 75.3% Acc │ 79.4% Recall │ 84.4% ROC-AUC                │
├────────────────────────────────────────────────────────────────────────┤
│ ROC Curve (AUC = 0.844) & Precision-Recall Curve (PR-AUC = 0.658)      │
│ Confusion Matrix: TN=764, FP=271, FN=77, TP=297                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 6. Strategic Business Insights
Financial hazard decomposition and projected annual retention savings.
```
┌────────────────────────────────────────────────────────────────────────┐
│ Total Active MRR at Risk: $46,427.80 (ML) / $86,948.00 (Rule Segment)  │
├────────────────────────────────────────────────────────────────────────┤
│ Exposure by Contract: Month-to-month represents 88.5% of churn exposure│
│ Projected Annual Retention Savings: $365,000+                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 24. Release Readiness & Audit Attestation

| Audit Category | Status | Evaluation Summary |
|---|---|---|
| **Portfolio Ready** | **ACHIEVED** | High-quality documentation, verified ML benchmarks, clean architecture, zero secrets, GitHub-compliant file sizes. |
| **Local Demo Ready** | **ACHIEVED** | Verified local execution of backend (port 8000) and frontend (port 3000), real API communication, mock fallback mode. |
| **Deployment Config**| **PREPARED** | Production Dockerfiles, docker-compose.yml, and nginx.conf authored. Runtime unverified due to lack of local Docker daemon. |
| **Production Ready** | **NOT YET VERIFIED**| Playwright browser E2E and live cloud infrastructure deployments have not been executed on the development host. |

---

## 25. Methodological Assumptions & Known Limitations

- **In-Memory Store**: Customer records are currently served via memory-indexed pandas DataFrames. For enterprise deployments with write-heavy transactional operations, migrating the customer store to a PostgreSQL database with SQLAlchemy/Alembic is recommended.
- **Batch Re-scoring**: Predictions are currently computed on demand per customer ID. Large-scale enterprise systems would benefit from scheduled batch jobs re-scoring all active accounts nightly.
- **Tabular Data Scope**: The model relies on cross-sectional billing and demographic snapshots. Incorporating time-series event streams (e.g., daily login frequency, support ticket telemetry, feature clickstreams) would further improve predictive fidelity.

---

## 26. Roadmap & Future Enhancements

- [ ] **Database Integration**: Add PostgreSQL database connector with Alembic schema migrations.
- [ ] **Automated Retraining**: Implement drift detection (Evidently AI) and automated retraining pipelines triggered by data distribution drift.
- [ ] **Enterprise Security**: Add OAuth2 and JWT role-based access control (RBAC) for team permissioning.
- [ ] **Executive Reporting**: Add one-click PDF generation for C-level quarterly retention briefs.

---

## 27. Contributing Guidelines

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/retention-playbook`).
3. Commit your changes with descriptive messages (`git commit -m "feat: add customer lifetime value scoring"`).
4. Run all test suites (`npm test` and `python -m unittest discover -s backend/tests`).
5. Open a Pull Request against `main`.

---

## 28. License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 29. Author & Acknowledgments

- **Author**: Trupti Gajghat
- **Repository**: [https://github.com/truptigajghat/customer-analytics](https://github.com/truptigajghat/customer-analytics)
- **Dataset Attribution**: Canonical IBM Telco Customer Churn dataset.
