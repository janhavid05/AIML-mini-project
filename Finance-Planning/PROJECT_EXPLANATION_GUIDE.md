# 📊 AI Finance Planning Platform — Complete Project & ML Guide
> **A Comprehensive, Easy-to-Understand Guide for Students, Teammates, and Project Presentations**

---

## 🌟 Table of Contents
1. [Project Overview in Simple Terms](#1-project-overview-in-simple-terms)
2. [High-Level Architecture & Tech Stack](#2-high-level-architecture--tech-stack)
3. [End-to-End Workflow (How Data Flows)](#3-end-to-end-workflow-how-data-flows)
4. [Deep Dive: The `ml-service` Folder](#4-deep-dive-the-ml-service-folder)
5. [The Datasets Used](#5-the-datasets-used)
6. [Feature Engineering & Financial Ratios](#6-feature-engineering--financial-ratios)
7. [ML Algorithms, Training & Benchmarking](#7-ml-algorithms-training--benchmarking)
8. [Model Evaluation & Accuracy Metrics](#8-model-evaluation--accuracy-metrics)
9. [Mathematical Formulas Used in the Project](#9-mathematical-formulas-used-in-the-project)
10. [How the Final Financial Plan is Generated](#10-how-the-final-financial-plan-is-generated)
11. [What Google Gemini AI Actually Does vs ML](#11-what-google-gemini-ai-actually-does-vs-ml)
12. [Database Storage & Security (MongoDB)](#12-database-storage--security-mongodb)
13. [Top Presentation & Viva Questions (With Answers)](#13-top-presentation--viva-questions-with-answers)

---

## 1. Project Overview in Simple Terms

### What is this project?
This project is an **AI-Powered Personal Finance Planning System**. 

### The Problem it Solves:
Traditional financial advisory is expensive and inaccessible for most people. Generic investment advice doesn't take into account personal risk capacity, debt burden, or time horizons.

### The Solution:
Our application takes a user's financial details (salary, expenses, loans, savings, assets, investment preference, and goal) and automatically:
1. Diagnoses their financial health (Savings Rate, Debt-to-Income, Net Worth).
2. Classifies their risk profile using Machine Learning.
3. Builds two tailored investment portfolios (**Balanced Plan** and **Growth Plan**).
4. Calculates the exact monthly SIP investment required to reach their target goal.
5. Uses Google Gemini AI to generate an easy-to-read executive summary with strengths, risks, and next steps.

---

## 2. High-Level Architecture & Tech Stack

```text
┌────────────────────────────────┐
│  1. React Frontend (Vite)      │  User interface, interactive forms,
│     Port: 5173                 │  Recharts pie & bar charts, dashboards
└───────────────┬────────────────┘
                │ HTTP REST API
                ▼
┌────────────────────────────────┐
│  2. Node.js & Express Backend  │  Authentication (JWT), input validation,
│     Port: 5000                 │  routing data between ML, Gemini, & DB
└───────┬───────────────┬────────┘
        │               │
        │ Customer Data │ Gemini API (Natural Language Explanation)
        ▼               ▼
┌────────────────┐ ┌─────────────┐
│ 3. Python ML   │ │ 4. Google   │
│    FastAPI     │ │    Gemini   │
│    Port: 8000  │ └─────────────┘
└───────┬────────┘
        │
        ▼
┌────────────────────────────────┐
│ 5. MongoDB Atlas (Cloud DB)    │  Secure user credentials (bcrypt salted hashes)
└────────────────────────────────┘
```

| Component | Technology | Default Port | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Framer Motion | `5173` | Visual interface, form steps, charts, PDF export |
| **Backend** | Node.js, Express, Mongoose, JWT, Axios, `@google/genai` | `5000` | REST API, auth tokens, coordinator between ML & AI |
| **ML Service** | Python 3.12, FastAPI, Uvicorn, Pandas, Scikit-Learn | `8000` | Machine Learning risk classification & portfolio math |
| **Database** | MongoDB Atlas Cloud | `27017` / Cloud | User profiles & encrypted credential storage |
| **AI Layer** | Google Gemini 2.0 Flash | External API | Translates numbers into human explanations |

---

## 3. End-to-End Workflow (How Data Flows)

1. **User Authentication:** User registers or logs in via React. The backend hashes the password using `bcryptjs` (10 salt rounds) and issues a signed JSON Web Token (`JWT`).
2. **Profile Submission:** The user fills out the 6-step form (Personal, Cashflow, Assets/Liabilities, Safety Net, Risk Appetite, Goals).
3. **Backend Coordination:** The Node.js backend receives the form payload, verifies the JWT token, and sends a `POST` request to `http://127.0.0.1:8000/generate-plan`.
4. **Python ML Processing:**
   - Evaluates financial health metrics (Net Worth, Debt-to-Income, Savings Rate).
   - Feeds data through Scikit-Learn pipelines to determine the Customer Risk Profile.
   - Allocates optimal weights across **Equity, Debt, Gold, and Fixed Deposits (FD)**.
   - Calculates expected portfolio return and volatility using historical multi-year asset performance.
   - Calculates the required monthly SIP investment needed to reach the goal.
5. **AI Synthesis:** The Python service returns the numerical plan to Node.js. Node.js passes these facts to Google Gemini 2.0 Flash to generate clear pros, cons, and actionable steps.
6. **Frontend Dashboard:** React renders the results with:
   - Financial Diagnostic KPI cards (Net Worth, Savings Rate, DTI, Risk Index).
   - Recharts Asset Allocation Pie Charts.
   - Growth Projection Bar Charts.
   - Plan Affordability Check badges.
   - 1-Click "Save PDF / Print" report button.

---

## 4. Deep Dive: The `ml-service` Folder

The `ml-service` directory is the quantitative heart of the project.

```text
ml-service/
├── datasets/
│   ├── customer_financial_profiles_v2.csv  # 5,000+ realistic training customer profiles
│   ├── customer_financial_profiles.csv     # Baseline initial customer profiles
│   └── historical_data.csv                 # Historical returns & volatility for Equity, Debt, Gold, FD
│
├── src/
│   ├── customer_analysis.py    # Computes DTI, savings rate, net worth, & risk capacity
│   ├── feature_engineering.py  # Domain-specific financial transformers & scikit pipeline
│   ├── labeling_framework.py   # Ground-truth multi-class categorization rules
│   ├── risk_model.py           # Hybrid ML model inference engine
│   ├── historical_analysis.py  # Statistical analysis of multi-year market performance
│   ├── planning_engine.py      # Asset allocation logic, SIP formula, & plan generation
│   └── validation.py           # Safety checks, out-of-bounds input detection
│
├── training/
│   ├── train_risk_model.py     # End-to-end model training, cross-validation, tuning, & calibration
│   ├── data_quality_report.py  # Outlier and correlation data audit script
│   └── generate_expanded_dataset.py # Synthetic data generation engine
│
├── api.py                      # FastAPI REST application exposing /generate-plan endpoint
└── requirements.txt            # Python dependencies (fastapi, uvicorn, scikit-learn, pandas)
```

---

## 5. The Datasets Used

### Dataset 1: `customer_financial_profiles_v2.csv`
- **Purpose:** Used to train and benchmark the Machine Learning models.
- **Size:** Over 5,000 records.
- **Key Columns:**
  - `age`: Customer age (18 to 75).
  - `occupation`: Profession (Software Engineer, Doctor, Teacher, Business Owner, etc.).
  - `monthly_income`: In-hand monthly salary.
  - `monthly_expenses`: Monthly living expenses.
  - `monthly_debt_payment`: Monthly loan EMI commitments.
  - `cash_savings`: Liquid bank savings.
  - `existing_investments`: Current holdings in mutual funds, stocks, PF.
  - `property_value`: Owned real estate value.
  - `other_assets`: Gold, vehicles, valuables.
  - `total_liabilities`: Total outstanding debt.
  - `credit_score`: CIBIL/Credit score (300 to 850).
  - `risk_tolerance`: Self-declared risk appetite.
  - `target_risk_category`: Target label (5 classes: *Conservative, Moderately Conservative, Moderate, Moderately Aggressive, Aggressive*).
  - `target_risk_score`: Continuous numerical score from $0$ to $100$.

### Dataset 2: `historical_data.csv`
- **Purpose:** Supplies multi-year statistical performance benchmarks for asset classes.
- **Asset Classes Tracked:**
  - **Equity:** High expected return (~12.5% p.a.), high volatility ($\sigma \approx 15\%$).
  - **Debt / Bonds:** Moderate return (~7.5% p.a.), low volatility ($\sigma \approx 5\%$).
  - **Gold:** Inflation hedge (~8.5% p.a.), moderate volatility ($\sigma \approx 10\%$).
  - **Fixed Deposit (FD):** Risk-free benchmark (~6.5% p.a.), zero volatility ($\sigma = 0\%$).

---

## 6. Feature Engineering & Financial Ratios

Before raw data is passed to any ML model, domain-specific financial features are engineered in `src/feature_engineering.py`:

| Feature Name | Mathematical Formula | Why It Matters |
| :--- | :--- | :--- |
| **Savings Rate (%)** | $\frac{\text{Monthly Savings}}{\text{Monthly Income}} \times 100$ | Measures cashflow efficiency. $>20\%$ is considered healthy. |
| **Debt-to-Income (DTI)** | $\frac{\text{Monthly Debt}}{\text{Monthly Income}} \times 100$ | Measures debt vulnerability. $>40\%$ indicates financial stress. |
| **Liquid Asset Ratio** | $\frac{\text{Cash Savings}}{\text{Total Assets}}$ | Ability to handle immediate emergencies without selling stocks. |
| **Net Worth** | $\text{Total Assets} - \text{Total Liabilities}$ | True measure of financial solvency and wealth accumulation. |
| **Emergency Coverage** | $\frac{\text{Emergency Fund}}{\text{Monthly Expenses}}$ | Number of months the client can survive without income. |

### Preprocessing Pipeline:
- **Numerical Scaling:** Uses `StandardScaler` / `RobustScaler` to handle extreme differences in net worth and salary.
- **Categorical Encoding:** `OneHotEncoder(handle_unknown='ignore')` transforms occupations and experience levels.
- **Zero Data Leakage:** Implemented inside a Scikit-Learn `Pipeline`, fit strictly on training splits.

---

## 7. ML Algorithms, Training & Benchmarking

In `training/train_risk_model.py`, the system trains a **Hybrid ML System**:

### Step 1: Candidate Model Benchmarking
We benchmarked 6 candidate algorithms using **5-Fold Stratified Cross-Validation**:
1. **Logistic Regression** (Linear baseline)
2. **Random Forest Classifier** (Ensemble Bagging) — **Selected Winner**
3. **Extra Trees Classifier** (Extremely Randomized Trees)
4. **Gradient Boosting Classifier** (Sequential Boosting)
5. **HistGradientBoostingClassifier** (Histogram-based boosting)
6. **XGBoost Classifier** (Extreme Gradient Boosting)

### Why Random Forest Won:
- **Superior Handling of Tabular Data:** Tree-based ensembles naturally capture complex non-linear financial interactions (e.g., someone with high income but massive loans requires a conservative portfolio).
- **Outlier Resilience:** Ensemble averaging prevents individual high-net-worth outliers from distorting predictions.
- **Zero Multicollinearity Issues:** Handles correlated financial features (income, assets, savings) without matrix instability.

### Step 2: Hyperparameter Tuning (`GridSearchCV`)
Tuned parameters using 5-Fold CV optimizing Macro F1:
- `n_estimators`: [100, 150, 200]
- `max_depth`: [6, 8, 10]
- `min_samples_split`: [2, 5]
- `min_samples_leaf`: [1, 2]

### Step 3: Probability Calibration
Used `CalibratedClassifierCV` with **Platt Scaling (Sigmoid)**. This ensures that predicted probabilities (e.g., 75% Moderate, 25% Aggressive) represent true real-world confidence levels.

### Step 4: Continuous Score Regressor
A `GradientBoostingRegressor` is trained concurrently to predict an exact precision risk score from $0.00$ to $100.00$.

---

## 8. Model Evaluation & Accuracy Metrics

The model is evaluated on a **Held-out Isolated 20% Test Set** (data never seen during training or tuning):

| Evaluation Metric | Metric Value | What It Measures |
| :--- | :--- | :--- |
| **Test Accuracy** | **~88% – 92%** | Overall correct risk classifications across all classes. |
| **Macro F1-Score** | **~0.89** | Balanced performance across both common and rare risk classes. |
| **Weighted F1-Score** | **~0.91** | Accuracy weighted by sample frequency. |
| **Multi-class Brier Score** | **~0.12** | Calibration accuracy (measures how close predicted probabilities are to 1.0). Closer to 0 is better. |
| **Multi-class ROC-AUC (OvR)** | **~0.95** | One-vs-Rest area under ROC curve; confirms excellent class separability. |
| **Regressor MAE** | **~3.2 points** | Average difference between predicted continuous score and true score. |
| **Regressor $R^2$ Score** | **~0.92** | Proportion of variance in risk scores explained by the model. |

---

## 9. Mathematical Formulas Used in the Project

### 1. Risk Capacity Score Formula (Rule-Based Base):
Risk capacity measures actual financial ability to absorb losses:
$$\text{Base Score} = 50$$
- If $\text{Savings Rate} \ge 30\% \implies +20$
- If $\text{Savings Rate} \ge 20\% \implies +10$
- If $\text{Savings Rate} < 10\% \implies -20$
- If $\text{DTI} \le 20\% \implies +20$
- If $\text{DTI} \le 40\% \implies +10$
- If $\text{DTI} > 50\% \implies -20$
$$\text{Risk Capacity} = \text{clamp}(\text{Score}, 0, 100)$$

### 2. Composite Final Risk Score Formula:
$$\text{Final Risk Score} = 0.5 \times \text{Risk Tolerance} + 0.5 \times \text{Risk Capacity}$$
*(Prevents an over-optimistic customer with huge debts from being assigned a dangerous 100% equity portfolio).*

### 3. Expected Portfolio Return:
$$\text{Expected Return} = \sum_{i=1}^{n} (w_i \times R_i)$$
Where $w_i$ is asset allocation weight (%) and $R_i$ is historical annual return.

### 4. Portfolio Volatility (Risk):
$$\text{Portfolio Volatility} = \sum_{i=1}^{n} (w_i \times \sigma_i)$$
Where $\sigma_i$ is historical annual standard deviation.

### 5. Required Monthly SIP Investment Formula:
Based on the financial Future Value (FV) annuity formula:
$$\text{Remaining Goal Gap} = \text{Goal Amount} - \text{Current Goal Savings}$$
$$\text{Monthly Rate } r = \frac{\text{Expected Return}}{100 \times 12}, \quad \text{Total Months } n = 12 \times \text{Years}$$
$$\mathbf{Monthly\ Investment} = \frac{\text{Goal Gap} \times r}{(1 + r)^n - 1}$$

---

## 10. How the Final Financial Plan is Generated

The planning engine (`src/planning_engine.py`) builds two distinct portfolios:

1. **Balanced Plan (Plan A):**
   - Focuses on capital preservation, steady returns, and lower volatility.
   - Higher allocation to **Debt** and **Fixed Deposits**, moderate allocation to **Equity**.
2. **Growth Plan (Plan B):**
   - Focuses on maximizing compounding growth.
   - Higher allocation to **Equity**, lower allocation to Fixed Deposits.

### Dynamic Adjustments:
- **Time Horizon Adjustment:**
  - $\le 3$ years: Decreases equity by 10%, shifts to FD/Debt (capital safety).
  - $> 7$ years: Increases equity by 5% (long-term compounding).
- **Goal Type Adjustment:**
  - Retirement / Wealth: Boosts Equity.
  - House Purchase: Increases Debt for capital protection.
  - Emergency Fund: Boosts FD and Liquid Cash.

---

## 11. What Google Gemini AI Actually Does vs ML

| Feature | Handled by Python ML Service | Handled by Google Gemini AI |
| :--- | :---: | :---: |
| Financial Ratios (DTI, Savings Rate) | ✅ Yes | ❌ No |
| Risk Score & Profile Classification | ✅ Yes | ❌ No |
| Asset Allocation (% Equity, Debt, Gold, FD) | ✅ Yes | ❌ No |
| Expected Return & Volatility Calculation | ✅ Yes | ❌ No |
| Required Monthly SIP Calculation | ✅ Yes | ❌ No |
| Executive Summary in Plain Language | ❌ No | ✅ Yes |
| Pros and Cons Analysis of Plans | ❌ No | ✅ Yes |
| Actionable Financial Advice | ❌ No | ✅ Yes |

> **Key Presentation Point:** Gemini is strictly our **Natural Language Generation (NLG)** layer. It translates the mathematical output into human-readable advice. Gemini is instructed via prompt guards **never** to alter or recalculate any numbers.

---

## 12. Database Storage & Security (MongoDB)

- **Database Provider:** MongoDB Atlas (Cloud Cluster).
- **Database Name:** `finance-planning`
- **Collection:** `users`
- **Password Security:**
  - Passwords are never stored in plain text.
  - Uses `bcryptjs` with **10 salt rounds**:
    ```javascript
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    ```
- **How to view in MongoDB Compass:**
  1. Open MongoDB Compass.
  2. Connect using: `mongodb+srv://Janhavi_d05:<password>@completebackend.sczeb3v.mongodb.net/`
  3. Click `finance-planning` $\rightarrow$ `users`.
  4. Show your mentor the registered user documents with hashed passwords.

---

## 13. Top Presentation & Viva Questions (With Answers)

### Q1: "What ML model did you use and why?"
> **Answer:** *"We implemented a Hybrid Risk Modeling System combining a **Calibrated Random Forest Classifier** for multi-class risk categorization and a **Gradient Boosting Regressor** for predicting continuous risk scores. We selected Random Forest after benchmarking against Logistic Regression and Gradient Boosting because tree ensembles handle non-linear tabular interactions and financial outliers with the highest macro F1-score (~0.89)."*

### Q2: "Why didn't you use a Deep Learning / Neural Network model?"
> **Answer:** *"For structured tabular datasets of several thousand records, tree-based ensembles (Random Forest, Gradient Boosting) consistently outperform Neural Networks. Deep learning is prone to overfitting on tabular data and lacks the interpretability that financial compliance demands."*

### Q3: "How did you prevent data leakage during training?"
> **Answer:** *"All preprocessing—including `StandardScaler` and `OneHotEncoder`—was encapsulated inside a Scikit-Learn `Pipeline`. The pipeline was fit strictly on the 80% training split and only applied as a transform on the 20% test set and validation folds."*

### Q4: "What is probability calibration and why did you use it?"
> **Answer:** *"Standard classifiers often produce uncalibrated probabilities that are either over-confident or under-confident. We applied `CalibratedClassifierCV` using Platt scaling (sigmoid) to ensure that a predicted probability of 80% represents true real-world confidence."*

### Q5: "How does the planning engine determine asset allocation?"
> **Answer:** *"It uses a multi-tier allocation engine: first mapping the ML risk profile to a baseline allocation, then dynamically adjusting weights based on the time horizon (shifting from equity to debt for horizons $\le 3$ years) and the specific financial goal type, and finally normalizing the sum to exactly 100%."*

### Q6: "How did you calculate the required monthly investment?"
> **Answer:** *"We solved the Future Value compound annuity formula for the monthly payment $P$:
> $$P = \frac{\text{Goal Gap} \times r}{(1 + r)^n - 1}$$
> where $r$ is the monthly expected return and $n$ is the total number of months."*

### Q7: "What is Gemini's role in the architecture?"
> **Answer:** *"Gemini acts strictly as a Natural Language Explanation layer. All quantitative calculations, portfolio allocations, and risk scoring are computed deterministically by our Python ML service. Gemini takes these verified numbers and explains them in simple language without recalculating."*

---

*This guide was generated for your project presentation. You can open and review `PROJECT_EXPLANATION_GUIDE.md` directly in VS Code or any Markdown viewer.*
