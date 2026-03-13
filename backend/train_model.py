"""
Train and save a Random Forest loan approval model.
Run this script once to generate the model file: python -m backend.train_model
"""
import numpy as np  # pyre-ignore[21]
import pandas as pd  # pyre-ignore[21]
from sklearn.ensemble import RandomForestClassifier  # pyre-ignore[21]
from sklearn.preprocessing import LabelEncoder  # pyre-ignore[21]
from sklearn.model_selection import train_test_split  # pyre-ignore[21]
from sklearn.metrics import classification_report  # pyre-ignore[21]
import joblib  # pyre-ignore[21]
import os

FEATURES = ["credit_score", "income", "loan_amount", "existing_debt",
            "employment_status", "loan_term"]

EMPLOYMENT_MAP = {"employed": 0, "self_employed": 1, "unemployed": 2}

def generate_synthetic_data(n=2000, seed=42):
    """
    Generate realistic synthetic loan data with rule-based labels.
    """
    rng = np.random.default_rng(seed)

    credit_scores = rng.integers(300, 850, n)
    incomes = rng.integers(15000, 200000, n)
    loan_amounts = rng.integers(1000, 100000, n)
    existing_debts = rng.integers(0, 80000, n)
    employment_statuses = rng.choice(["employed", "self_employed", "unemployed"], n,
                                     p=[0.65, 0.25, 0.10])
    loan_terms = rng.choice([12, 24, 36, 48, 60], n)

    # Rule-based label: realistic approval criteria
    approved = []
    for i in range(n):
        score = 0
        if credit_scores[i] >= 700: score += 3
        elif credit_scores[i] >= 600: score += 1

        dti = (existing_debts[i] + loan_amounts[i]) / max(incomes[i], 1)
        if dti < 0.35: score += 3
        elif dti < 0.5: score += 1

        if employment_statuses[i] == "employed": score += 2
        elif employment_statuses[i] == "self_employed": score += 1

        if loan_terms[i] >= 36: score += 1

        # Add noise
        noise = rng.integers(-1, 2)
        approved.append(1 if (score + noise) >= 5 else 0)

    df = pd.DataFrame({
        "credit_score": credit_scores,
        "income": incomes,
        "loan_amount": loan_amounts,
        "existing_debt": existing_debts,
        "employment_status": [EMPLOYMENT_MAP[e] for e in employment_statuses],
        "loan_term": loan_terms,
        "approved": approved
    })
    return df


def train_model():
    print("[*] Generating synthetic training data...")
    df = generate_synthetic_data()

    X = df[FEATURES]
    y = df["approved"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("[*] Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8,
                                   class_weight="balanced")
    model.fit(X_train, y_train)

    print("\n[*] Test Set Evaluation:")
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["Rejected", "Approved"]))

    model_path = os.path.join(os.path.dirname(__file__), "loan_model.pkl")
    joblib.dump(model, model_path)
    print(f"[OK] Model saved to {model_path}")
    return model_path


if __name__ == "__main__":
    train_model()
