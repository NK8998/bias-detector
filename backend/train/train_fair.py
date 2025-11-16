import pandas as pd
import numpy as np
import joblib
import json
import os

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from fairlearn.metrics import MetricFrame, selection_rate



# ============================================================
# COLUMN DISCOVERY (flexible mapping)
# ============================================================

COLUMN_MAP = {
    "dependents": ["no_of_dependents"],
    "education": ["education"],
    "self_employed": ["self_employed"],
    "income": ["income_annum"],
    "loan_amount": ["loan_amount"],
    "loan_term": ["loan_term"],
    "cibil_score": ["cibil_score"],
    "residential_assets": ["residential_assets_value"],
    "commercial_assets": ["commercial_assets_value"],
    "luxury_assets": ["luxury_assets_value"],
    "bank_asset_value": ["bank_asset_value"],
    "risk": ["loan_status"],
}


def find_column(df: pd.DataFrame, options):
    df_cols = [c.lower().strip() for c in df.columns]
    for name in options:
        if name.lower() in df_cols:
            return name.lower()
    raise KeyError(f"Missing required column among: {options}")


# ============================================================
# ENCODERS
# ============================================================

def encode_categorical(series: pd.Series):
    categories = list(pd.factorize(series)[1])
    mapping = {cat: i for i, cat in enumerate(categories)}
    encoded = series.map(mapping).fillna(-1).astype(int)
    return encoded, mapping


# ============================================================
# PREPROCESSING
# ============================================================

def preprocess_training_data(df: pd.DataFrame):
    df.columns = [c.lower().strip() for c in df.columns]

    # Extract columns using flexible matching
    col_dep = find_column(df, COLUMN_MAP["dependents"])
    col_edu = find_column(df, COLUMN_MAP["education"])
    col_self = find_column(df, COLUMN_MAP["self_employed"])
    col_income = find_column(df, COLUMN_MAP["income"])
    col_amount = find_column(df, COLUMN_MAP["loan_amount"])
    col_term = find_column(df, COLUMN_MAP["loan_term"])
    col_cibil = find_column(df, COLUMN_MAP["cibil_score"])
    col_res = find_column(df, COLUMN_MAP["residential_assets"])
    col_com = find_column(df, COLUMN_MAP["commercial_assets"])
    col_lux = find_column(df, COLUMN_MAP["luxury_assets"])
    col_bank = find_column(df, COLUMN_MAP["bank_asset_value"])
    col_risk = find_column(df, COLUMN_MAP["risk"])

    # Remove loan_id if present
    df = df.drop(columns=[c for c in df.columns if c == "loan_id"], errors="ignore")

    X = pd.DataFrame()
    X["no_of_dependents"] = df[col_dep].astype(float)
    X["education"], edu_map = encode_categorical(df[col_edu].astype(str))
    X["self_employed"], self_map = encode_categorical(df[col_self].astype(str))
    X["income_annum"] = df[col_income].astype(float)
    X["loan_amount"] = df[col_amount].astype(float)
    X["loan_term"] = df[col_term].astype(float)
    X["cibil_score"] = df[col_cibil].astype(float)
    X["residential_assets_value"] = df[col_res].astype(float)
    X["commercial_assets_value"] = df[col_com].astype(float)
    X["luxury_assets_value"] = df[col_lux].astype(float)
    X["bank_asset_value"] = df[col_bank].astype(float)
    positive_labels = {"approved"}  # dataset is Approved / Rejected

    y_raw = df[col_risk].astype(str).str.strip().str.lower()
    y = y_raw.apply(lambda v: 1 if v in positive_labels else 0)

    # Return mappings for UI display (optional)
    mappings = {
        "education": edu_map,
        "self_employed": self_map,
    }

    return X, y, mappings


# ============================================================
# FAIRNESS (dynamic, multi-attribute)
# ============================================================

def detect_sensitive_features(df: pd.DataFrame):
    """
    Detect candidate sensitive attributes automatically.
    Any low-cardinality categorical OR small-range integer column qualifies.
    """
    candidates = []
    for col in df.columns:
        if df[col].dtype in ["object", "category"]:
            candidates.append(col)
        elif df[col].dtype in ["int64", "int32", "int16"] and df[col].nunique() <= 15:
            candidates.append(col)
    return candidates


def compute_fairness_slices(X_test, y_true, y_pred):
    """
    Computes fairness slices for selected numeric and categorical features.
    For numeric columns, it automatically bins them into quartiles.
    For categorical columns, it uses their unique values directly.
    """
    fairness_features = [
        "no_of_dependents",
        "education",
        "self_employed",
        "income_annum",
        "loan_amount",
        "loan_term",
        "cibil_score",
    ]

    slices = {}

    for feature in fairness_features:
        col = X_test[feature]

        # Numeric columns → bin into quartiles so fairness makes sense
        if pd.api.types.is_numeric_dtype(col):
            bins = pd.qcut(col, q=4, duplicates="drop")
            unique_groups = bins.unique()

            slices[feature] = {}

            for g in unique_groups:
                idx = bins == g
                slices[feature][str(g)] = {
                    "count": int(idx.sum()),
                    "accuracy": float(accuracy_score(y_true[idx], y_pred[idx])) if idx.sum() > 0 else None,
                    "selection_rate": float(np.mean(y_pred[idx])) if idx.sum() > 0 else None,
                }

        # Categorical columns → group by unique values
        else:
            slices[feature] = {}
            for g in col.unique():
                idx = col == g
                slices[feature][str(g)] = {
                    "count": int(idx.sum()),
                    "accuracy": float(accuracy_score(y_true[idx], y_pred[idx])) if idx.sum() > 0 else None,
                    "selection_rate": float(np.mean(y_pred[idx])) if idx.sum() > 0 else None,
                }

    return slices

# ============================================================
# LOGISTIC FORMATTING
# ============================================================

def build_logistic_equation(model, columns):
    eq = "logit(p) = "
    for coef, name in zip(model.coef_[0], columns):
        eq += f"({coef:.4f} * {name}) + "
    eq += f"(intercept={model.intercept_[0]:.4f})"
    return eq


# ============================================================
# REMOVE OUTLIERS
# ============================================================

def remove_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    
    
    df[column] = df[column].clip(lower, upper)
    return df

# ============================================================
# MAIN TRAINING FUNCTION
# ============================================================

def train_and_save_model(csv_path: str, out_dir="./models/fair"):
    os.makedirs(out_dir, exist_ok=True)

    df = pd.read_csv(csv_path)

    
    X, y, value_mapping = preprocess_training_data(df)

    num_cols = ['no_of_dependents','income_annum','loan_amount','loan_term',
            'cibil_score','residential_assets_value',
            'commercial_assets_value','luxury_assets_value','bank_asset_value']

    for col in num_cols:
        df = remove_outliers_iqr(df, col)

    print(X.head())
    print("--------------------")
    print(y.head())

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    scaler = None
    logistic_equation = None
    logistic_coefficients = None
    decision_tree_rules = None

    # --------------------------------------------------------
    # MODEL TRAINING
    # --------------------------------------------------------
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)

    logistic_equation = build_logistic_equation(model, X.columns)
    logistic_coefficients = [
        {
            "Feature": name,
            "Coefficient": float(coef),
            "Influence": int(np.sign(coef)),
        }
        for name, coef in zip(X.columns, model.coef_[0])
    ]

    model_type_used = "logistic_regression"
    # --------------------------------------------------------
    # ACCURACY
    # --------------------------------------------------------

    overall_accuracy = float(accuracy_score(y_test, y_pred))

    # --------------------------------------------------------
    # FAIRNESS
    # --------------------------------------------------------

    sensitive_features = detect_sensitive_features(X_test)
    if not sensitive_features:
        sensitive_features = ["gender"]

    primary_sensitive = sensitive_features[0]

    mf = MetricFrame(
        metrics={"selection_rate": selection_rate, "accuracy": accuracy_score},
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=X_test[primary_sensitive],
    )

    by_group = mf.by_group
    if isinstance(by_group, pd.Series):
        by_group = by_group.to_frame(by_group.name)

    selection_rates = by_group.get("selection_rate", pd.Series()).to_dict()
    accuracies = by_group.get("accuracy", pd.Series()).to_dict()

    sr = pd.Series(selection_rates)
    selection_rate_gap = float(sr.max() - sr.min()) if len(sr) > 1 else 0.0
    demographic_parity_difference = selection_rate_gap
    statistical_parity_ratio = (
        float(sr.min() / sr.max()) if len(sr) > 1 and sr.max() != 0 else None
    )
    bias_flag = bool(selection_rate_gap > 0.15)

    fairness_slices = compute_fairness_slices(
        X_test, y_test, y_pred
    )

    # --------------------------------------------------------
    # SAVE MODEL BUNDLE
    # --------------------------------------------------------

    model_dir = os.path.join(out_dir, model_type_used)
    os.makedirs(model_dir, exist_ok=True)

    training_metrics = {
        "columns": list(X.columns),
        "value_mapping": value_mapping,
        "overall_accuracy": overall_accuracy,
        "selection_rates": selection_rates,
        "accuracies": accuracies,
        "selection_rate_gap": selection_rate_gap,
        "demographic_parity_difference": demographic_parity_difference,
        "statistical_parity_ratio": statistical_parity_ratio,
        "bias_flag": bias_flag,
        "fairness_slices": fairness_slices,
        "sensitive_features": sensitive_features,
        "primary_fairness_axis": primary_sensitive,
        "logistic_equation": logistic_equation,
        "logistic_coefficients": logistic_coefficients,
        "decision_tree_rules": decision_tree_rules,
    }

    bundle = {
        "model": model,
        "scaler": scaler,
        "feature_order": list(X.columns),
        "training_metrics": training_metrics
    }

    joblib.dump(bundle, os.path.join(model_dir, "bundle.pkl"))

    # --------------------------------------------------------
    # METADATA FOR DEBUGGING + UI
    # --------------------------------------------------------

    metadata = {
        "model_type": model_type_used,
        "overall_accuracy": overall_accuracy,
        "selection_rates": selection_rates,
        "accuracies": accuracies,
        "selection_rate_gap": selection_rate_gap,
        "demographic_parity_difference": demographic_parity_difference,
        "statistical_parity_ratio": statistical_parity_ratio,
        "bias_flag": bias_flag,
        "fairness_slices": fairness_slices,
        "sensitive_features": sensitive_features,
        "primary_fairness_axis": primary_sensitive,
        "columns": list(X.columns),
        "value_mapping": value_mapping,
        "logistic_equation": logistic_equation,
        "logistic_coefficients": logistic_coefficients,
        "decision_tree_rules": decision_tree_rules,
        "feature_order": list(X.columns),
    }

    json.dump(metadata, open(os.path.join(model_dir, "metadata.json"), "w"), indent=4)

    print(f"\n=== {model_type_used} training complete ===")
    print(json.dumps(metadata, indent=4))


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    train_and_save_model("./datasets/loan_approval_dataset.csv")
