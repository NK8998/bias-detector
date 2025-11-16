import pandas as pd
import numpy as np
from sklearn import tree
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score
from fairlearn.metrics import MetricFrame, selection_rate
import shap
import base64
from io import BytesIO
import matplotlib
matplotlib.use("Agg")  # Use headless backend BEFORE importing pyplot
import matplotlib.pyplot as plt


def train_and_analyze(df, model_type, bias_threshold=0.15):
    """
    Trains the model, calculates metrics, and returns all results,
    including a base64 encoded image of the SHAP plot and fairness slices
    across multiple attributes (gender, job, age, credit, duration).
    """
    df = df.copy()
    df.columns = [c.strip().lower() for c in df.columns]

    # --- Data Mapping and Preparation (Identical to your original code) ---
    column_map = {
        "age": ["age"],
        "income": ["job"],
        "loan_amount": ["credit amount", "creditamount"],
        "credit_score": ["duration"],
        "gender": ["sex"],
        "approved": ["risk"]
    }

    def find_col(possible_names):
        for name in possible_names:
            if name.lower() in df.columns:
                return name.lower()
        raise KeyError(f"Missing expected column among: {possible_names}")

    try:
        age_col = find_col(column_map["age"])
        income_col = find_col(column_map["income"])
        loan_col = find_col(column_map["loan_amount"])
        credit_col = find_col(column_map["credit_score"])
        gender_col = find_col(column_map["gender"])
        approved_col = find_col(column_map["approved"])
    except KeyError as e:
        return {"error": str(e)}, None, None, None

    # Prepare X, y
    X = df[[age_col, income_col, loan_col, credit_col]].copy()
    X["gender"] = (df[gender_col].astype(str).str.lower() == "male").astype(int)
    y = (df[approved_col].astype(str).str.lower().isin(["good", "approved", "1"])).astype(int)
    # factorize income/job to numeric categories
    X[income_col] = pd.factorize(X[income_col])[0]
    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

    # Split & scale
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()

    tree_image_base64 = None

    # --- Model Training ---
    if model_type == "logistic":
        feature_names = X_train.columns

        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=feature_names)
        X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=feature_names)

        model = LogisticRegression(max_iter=1000)
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)

        # Logic extraction
        coef_df = pd.DataFrame({
            "Feature": X.columns,
            "Coefficient": model.coef_[0],
            "Influence": np.sign(model.coef_[0])
        })
        equation_str = "Logit(p) = " + " + ".join(
            [f"({coef:.3f} * {feat})" for feat, coef in zip(X.columns, model.coef_[0])]
        ) + f" + ({model.intercept_[0]:.3f})"

        decision_logic = (
            "The model increases approval odds when features with positive coefficients "
            "grow (e.g., higher income proxy or shorter duration). "
            "Negative coefficients reduce the odds (e.g., longer loan duration or higher loan amount)."
        )
        # Explainer for Logistic Regression uses scaled data
        explainer = shap.Explainer(model, X_train_scaled_df)
        shap_values = explainer(X_test_scaled_df)

        shap_data_for_plot = (shap_values, X_test_scaled_df)

    else:  # Decision Tree
        model = DecisionTreeClassifier(max_depth=5, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        tree_rules = export_text(model, feature_names=list(X.columns))
        coef_df = None
        equation_str = None
        decision_logic = "Decision tree rules:\n" + tree_rules

        # Explainer for Decision Tree uses unscaled data
        explainer = shap.Explainer(model, X_train)
        shap_values = explainer(X_test)
        shap_data_for_plot = (shap_values, X_test)

        # --- Decision Tree Visualization (sklearn) ---
        plt.figure(figsize=(20, 10))
        tree.plot_tree(
            model,
            feature_names=list(X.columns),
            class_names=["Rejected", "Approved"],
            filled=True,
            rounded=True,
        )
        buf_tree = BytesIO()
        plt.savefig(buf_tree, format="png", bbox_inches="tight", dpi=150)
        plt.close()
        tree_image_base64 = base64.b64encode(buf_tree.getvalue()).decode("utf-8")


    def safe_div(a, b):
        return float(a / b) if b not in (0, None) else None

    def to_py(v):
        """Convert numpy / pandas types to native Python types recursively where needed."""
        if isinstance(v, (np.integer, np.int32, np.int64)):
            return int(v)
        if isinstance(v, (np.floating, np.float32, np.float64)):
            return float(v)
        if pd.isna(v):
            return None
        return v

    def clean_dict(d):
        """Recursively convert numpy types in dict/list to python built-ins."""
        if isinstance(d, dict):
            return {str(k): clean_dict(v) for k, v in d.items()}
        if isinstance(d, list):
            return [clean_dict(x) for x in d]
        return to_py(d)

    # --- Fairness: single-feature gender (legacy) & grouped confusion metrics ---
    sensitive_features_gender = X_test["gender"]

    mf_gender = MetricFrame(
        metrics={"selection_rate": selection_rate, "accuracy": accuracy_score},
        y_true=y_test,
        y_pred=y_pred,
        sensitive_features=sensitive_features_gender
    )

    # Build confusion metrics helper
    def build_confusion_metrics_for_series(series):
        """
        series: pandas Series aligned with X_test index; values are group identifiers
        returns dict of per-group confusion metrics and summary differences
        """
        series = series.reindex(X_test.index)  # align just in case
        fairness_extra_local = {}
        for g in sorted(series.unique(), key=lambda x: (str(x))):
            mask = (series == g)
            y_true_g = y_test[mask]
            # y_pred is numpy aligned to X_test ordering; create aligned series
            y_pred_series = pd.Series(y_pred, index=X_test.index)
            y_pred_g = y_pred_series[mask]

            tp = int(((y_pred_g == 1) & (y_true_g == 1)).sum())
            tn = int(((y_pred_g == 0) & (y_true_g == 0)).sum())
            fp = int(((y_pred_g == 1) & (y_true_g == 0)).sum())
            fn = int(((y_pred_g == 0) & (y_true_g == 1)).sum())

            tpr = safe_div(tp, tp + fn)
            fpr = safe_div(fp, fp + tn)
            tnr = safe_div(tn, tn + fp)
            fnr = safe_div(fn, fn + tp)
            precision = safe_div(tp, tp + fp)
            npv = safe_div(tn, tn + fn)
            fdr = safe_div(fp, tp + fp)
            forr = safe_div(fn, tn + fn)

            fairness_extra_local[str(g)] = {
                "TP": tp,
                "TN": tn,
                "FP": fp,
                "FN": fn,
                "TPR": tpr,
                "FPR": fpr,
                "TNR": tnr,
                "FNR": fnr,
                "Precision": precision,
                "Negative_Predictive_Value": npv,
                "False_Discovery_Rate": fdr,
                "False_Omission_Rate": forr,
            }

        # Make sure all values are native python types
        fairness_extra_local = clean_dict(fairness_extra_local)
        return fairness_extra_local

    # -------------------------
    # Multi-attribute fairness slices
    # -------------------------
    fairness_slices = {}

    # Build bucketed series safely (fallback if qcut fails)
    def safe_qcut(series, q=4, labels=None):
        try:
            return pd.qcut(series, q=q, labels=labels, duplicates="drop")
        except Exception:
            # fallback to pd.cut with equal-width bins
            try:
                return pd.cut(series, bins=q, labels=labels, duplicates="drop")
            except Exception:
                # final fallback: return original values as strings (no bucketing)
                return series.astype(str)

    slice_features = {
        "gender": X_test["gender"].astype(str),
        "job": X_test[income_col].astype(str),  # factorized job codes as strings
        "credit_amount": safe_qcut(X_test[loan_col], q=4, labels=["q1", "q2", "q3", "q4"]),
        "duration": safe_qcut(X_test[credit_col], q=4, labels=["q1", "q2", "q3", "q4"]),
        "age": safe_qcut(X_test[age_col], q=4, labels=["q1", "q2", "q3", "q4"]),
        # raw numeric bucket for loan amount and duration (alternative)
        "loan_amount": X_test[loan_col].astype(str),
        #"duration_raw": X_test[credit_col].astype(str),
    }

    # compute each slice
    for slice_name, series in slice_features.items():
        # ensure series has same index as X_test
        series = pd.Series(series, index=X_test.index)
        # MetricFrame per slice
        mf = MetricFrame(
            metrics={"selection_rate": selection_rate, "accuracy": accuracy_score},
            y_true=y_test,
            y_pred=y_pred,
            sensitive_features=series
        )

        by_group = clean_dict(mf.by_group.to_dict())  # numeric types fixed
        # selection rate gap for this slice
        try:
            sel_rates = [v for v in (mf.by_group["selection_rate"].values if hasattr(mf.by_group["selection_rate"], "values") else list(mf.by_group["selection_rate"])) if v is not None]
            sel_gap = float(max(sel_rates) - min(sel_rates)) if len(sel_rates) > 1 else 0.0
        except Exception:
            # fallback using dict values
            try:
                sr_vals = [float(v) for v in mf.by_group["selection_rate"].to_dict().values()]
                sel_gap = float(max(sr_vals) - min(sr_vals)) if len(sr_vals) > 1 else 0.0
            except Exception:
                sel_gap = None

        # confusion metrics per group (TP/TN/FP/FN etc.)
        confusion_per_group = build_confusion_metrics_for_series(series)

        # equal opportunity difference (TPR gap) and average odds (mean of TPR/FPR gaps)
        tpr_list = [v.get("TPR") for v in confusion_per_group.values() if v.get("TPR") is not None]
        fpr_list = [v.get("FPR") for v in confusion_per_group.values() if v.get("FPR") is not None]
        equal_opp_diff = float(max(tpr_list) - min(tpr_list)) if len(tpr_list) > 1 else None
        avg_odds = float(((max(tpr_list) - min(tpr_list)) + (max(fpr_list) - min(fpr_list))) / 2) if (len(tpr_list) > 1 and len(fpr_list) > 1) else None

        # statistical parity ratio (min / max selection rate) and demographic parity difference
        try:
            sel_vals = [v for v in mf.by_group["selection_rate"].tolist() if v is not None]
            stat_parity_ratio = float(min(sel_vals) / max(sel_vals)) if (len(sel_vals) > 1 and max(sel_vals) != 0) else None
            demographic_parity_diff = float(max(sel_vals) - min(sel_vals)) if len(sel_vals) > 1 else 0.0
        except Exception:
            stat_parity_ratio = None
            demographic_parity_diff = None

        fairness_slices[slice_name] = {
            "by_group": by_group,
            #"fairness_confusion_metrics": confusion_per_group,
            "selection_rate_gap": to_py(sel_gap) if sel_gap is not None else None,
            "demographic_parity_difference": to_py(demographic_parity_diff),
            "statistical_parity_ratio": to_py(stat_parity_ratio),
            "equal_opportunity_difference": to_py(equal_opp_diff),
            "average_odds_difference": to_py(avg_odds),
        }

    # Clean the final fairness_slices dict keys/values to be JSON-safe
    fairness_slices = clean_dict(fairness_slices)

    # --- SHAP Plot Generation (Image as Base64) ---
    plt.figure()
    shap.summary_plot(shap_data_for_plot[0], pd.DataFrame(shap_data_for_plot[1], columns=X.columns), show=False)

    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight', dpi=150)
    plt.close()  # Close plot to free memory
    shap_image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    # --- Final Results Dictionary ---
    results = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "selection_rate_gap": to_py(float(max(mf_gender.by_group["selection_rate"]) - min(mf_gender.by_group["selection_rate"]))) if len(mf_gender.by_group["selection_rate"]) > 1 else 0.0,
        #"metrics_by_gender": clean_dict(mf_gender.by_group.to_dict()),
        "bias_flag": bool((max(mf_gender.by_group["selection_rate"]) - min(mf_gender.by_group["selection_rate"])) > bias_threshold) if len(mf_gender.by_group["selection_rate"]) > 1 else False,
        "model_type": model_type,
        "equation": equation_str,
        "coefficients": clean_dict(coef_df.to_dict(orient="records")) if coef_df is not None else None,
        "decision_logic": decision_logic,
        "tree_image": tree_image_base64 if model_type == "tree" else None,
        "shap_image": shap_image_base64,
        #"fairness_confusion_metrics": build_confusion_metrics_for_series(X_test["gender"].astype(str)),
        "demographic_parity_difference": to_py(float(max(mf_gender.by_group["selection_rate"]) - min(mf_gender.by_group["selection_rate"]))) if len(mf_gender.by_group["selection_rate"]) > 1 else 0.0,
        "statistical_parity_ratio": to_py(float(min(mf_gender.by_group["selection_rate"]) / max(mf_gender.by_group["selection_rate"]))) if len(mf_gender.by_group["selection_rate"]) > 1 and max(mf_gender.by_group["selection_rate"]) != 0 else None,
        "fairness_slices": fairness_slices
    }

    return results
