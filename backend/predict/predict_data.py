import pandas as pd
import joblib
from sklearn.metrics import accuracy_score
from fairlearn.metrics import MetricFrame, selection_rate
import os
MODEL_DIR = "predict\\models"

def load_model_bundle(model_type: str, bias_flag=False):
    pwd = os.getcwd()
    sub_folder = "biased" if bias_flag else "fair"
    folder = os.path.join(pwd, MODEL_DIR, sub_folder, model_type)
    bundle = joblib.load(os.path.join(folder, "bundle.pkl"))
    return bundle


def prepare_features(df: pd.DataFrame, feature_order):
    df_cols = [c.lower() for c in df.columns]
    df.columns = df_cols

    missing = [f for f in feature_order if f not in df.columns]
    if missing:
        raise KeyError(f"Missing columns in input: {missing}")

    return df[feature_order]


def predict_single(payload: dict, bundle):
    model = bundle["model"]
    scaler = bundle["scaler"]
    feature_order = bundle["feature_order"]

    df = pd.DataFrame([payload])
    X = prepare_features(df, feature_order)

    if scaler:
        X_scaled = scaler.transform(X)
    else:
        X_scaled = X

    prob = float(model.predict_proba(X_scaled)[0][1])
    approved = int(prob >= 0.5)

    return {
        "probability": prob,
        "approved": approved
    }

def prepare_input(df, feature_order, column_mappings=None, value_mappings=None):
    df = df.copy()

    df.columns = [c.lower().strip() for c in df.columns]
    
    if column_mappings:
        normalized_map = {k.lower().strip(): v.lower().strip()
                          for k, v in column_mappings.items()}
        df = df.rename(columns=normalized_map)

    if value_mappings:
        for col, mapping in value_mappings.items():
            if col in df.columns:
                df[col] = (
                    df[col]
                    .astype(str)
                    .str.lower()
                    .str.strip()
                    .map(mapping)
                    .fillna(-1)
                    .astype(int)
                )

    missing = [c for c in feature_order if c not in df.columns]
    if missing:
        raise KeyError(f"Missing after mapping: {missing}")

    X = df[feature_order].copy()

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(-1)

    return X


def predict_bulk(df: pd.DataFrame, bundle):
    model = bundle["model"]
    scaler = bundle["scaler"]
    feature_order = bundle["feature_order"]
    value_mappings = bundle["training_metrics"].get("value_mapping", {})
    column_mappings = bundle["training_metrics"].get("column_mapping", {})

    X = prepare_input(df, feature_order,
                        column_mappings=column_mappings,
                        value_mappings=value_mappings)

    if scaler:
        X_scaled = scaler.transform(X)
    else:
        X_scaled = X

    probs = model.predict_proba(X_scaled)[:, 1]
    decisions = (probs >= 0.5).astype(int)

    return {
        "average_probability": float(probs.mean()),
        "approval_rate": float(decisions.mean()),
        "row_count": len(df)
    }



def predict(payload_or_df, model_type="logistic_regression", bias_flag=False):
    bundle = load_model_bundle(model_type, bias_flag=bias_flag)

    if isinstance(payload_or_df, dict):
        single_result = predict_single(payload_or_df, bundle)
        return {
            **single_result,
            "model_metrics": bundle["training_metrics"]
        }
    elif isinstance(payload_or_df, pd.DataFrame):
        bulk = predict_bulk(payload_or_df, bundle)
        return {
            **bulk,
            **bundle["training_metrics"] 
        }
    else:
        raise ValueError("Unsupported input type. Provide dict or DataFrame.")

if __name__ == "__main__":
    # Example usage
    sample_payload = {
        "no_of_dependents": 4,
        "education": 2,
        "self_employed" : 1,
        "income_annum" : 60000,
        "loan_amount": 150,
        "loan_term": 360,
        "cibil_score": 750,
        "residential_assets_value" : 300000,
        "commercial_assets_value" : 2,
        "luxury_assets_value": 50000,
        "bank_asset_value": 150000,
    }


    result1  = predict(sample_payload, model_type="logistic_regression")
    print(result1)
