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
from imblearn.over_sampling import SMOTE


# ============================================================
# COLUMN DISCOVERY (flexible mapping)
# ============================================================

COLUMN_MAP = {
    "age": ["age"],
    "job": ["job", "profession", "occupation"],
    "credit_amount": ["credit amount", "creditamount", "credit_amount", "amount"],
    "duration": ["duration", "term"],
    "gender_raw": ["sex", "gender"],
    "risk": ["risk", "label", "target", "outcome"],
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

    col_age = find_column(df, COLUMN_MAP["age"])
    col_job = find_column(df, COLUMN_MAP["job"])
    col_amount = find_column(df, COLUMN_MAP["credit_amount"])
    col_duration = find_column(df, COLUMN_MAP["duration"])
    col_gender = find_column(df, COLUMN_MAP["gender_raw"])
    col_risk = find_column(df, COLUMN_MAP["risk"])

    X = pd.DataFrame()
    X["age"] = df[col_age].astype(float)

    # gender → binary
    X["gender"] = (df[col_gender].astype(str).str.lower() == "male").astype(int)

    # job categorical encoding
    X["job"], job_mapping = encode_categorical(df[col_job].astype(str))

    # amount + duration
    X["credit_amount"] = df[col_amount].astype(float)
    X["duration"] = df[col_duration].astype(float)

    # labels
    y = df[col_risk].astype(str).str.lower()
    y = y.isin(["good", "approved", "1"]).astype(int)

    column_mapping = {
        col_age: "age",
        col_job: "job",
        col_amount: "credit_amount",
        col_duration: "duration",
        col_gender: "gender",
        col_risk: "risk"
    }

    value_mapping = {
        "gender": {"male": 1, "female": 0}
    }

    return X, y, column_mapping, value_mapping


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

    import numpy as np
    import pandas as pd
    from sklearn.metrics import accuracy_score

    fairness_features = ["age", "job", "gender", "credit_amount", "duration"]

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
# MAIN TRAINING FUNCTION
# ============================================================

def train_and_save_model(csv_path: str, out_dir="./models/biased"):
    os.makedirs(out_dir, exist_ok=True)

    df = pd.read_csv(csv_path)
    X, y, column_mapping, value_mapping = preprocess_training_data(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    sm = SMOTE(random_state=42)
    X_resampled, y_resampled = sm.fit_resample(X_train, y_train)

    scaler = None
    logistic_equation = None
    logistic_coefficients = None
    decision_tree_rules = None

    # --------------------------------------------------------
    # MODEL TRAINING
    # --------------------------------------------------------

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_resampled)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=500)
    model.fit(X_train_scaled, y_resampled)
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
        "column_mapping": column_mapping,
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
        "column_mapping": column_mapping,
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
    train_and_save_model("./datasets/german_credit_data.csv")


