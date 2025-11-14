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
    including a base64 encoded image of the SHAP plot.
    """
    df.columns = [c.strip().lower() for c in df.columns]

    # --- Data Mapping and Preparation (Identical to your original code) ---
    column_map = {
        "age": ["age"], "income": ["job"], "loan_amount": ["credit amount", "creditamount"],
        "credit_score": ["duration"], "gender": ["sex"], "approved": ["risk"]
    }

    def find_col(possible_names):
        for name in possible_names:
            if name.lower() in df.columns:
                return name.lower()
        # Raise KeyError if essential columns are missing
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
    X["gender_Male"] = (df[gender_col].astype(str).str.lower() == "male").astype(int)
    y = (df[approved_col].astype(str).str.lower().isin(["good", "approved", "1"])).astype(int)
    X[income_col] = pd.factorize(X[income_col])[0]
    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

    # Split & scale
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()

    tree_image_base64 = None
    
    # --- Model Training ---
    if model_type == "logistic":
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        model = LogisticRegression()
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
        explainer = shap.Explainer(model, X_train_scaled)
        shap_values = explainer(X_test_scaled)
        shap_data_for_plot = (shap_values, X_test_scaled)
        
    else: # Decision Tree
        model = DecisionTreeClassifier(max_depth=3, random_state=42)
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
    
    # --- Fairness Metrics ---
    sensitive_features = X_test["gender_Male"]
    mf = MetricFrame(
        metrics={"selection_rate": selection_rate, "accuracy": accuracy_score},
        y_true=y_test, y_pred=y_pred, sensitive_features=sensitive_features
    )
    selection_gap = abs(mf.by_group["selection_rate"].max() - mf.by_group["selection_rate"].min())
    is_biased = selection_gap > bias_threshold

    # --- SHAP Plot Generation (Image as Base64) ---
    plt.figure() 
    shap.summary_plot(shap_data_for_plot[0], pd.DataFrame(shap_data_for_plot[1], columns=X.columns), show=False)
    
    buf = BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight', dpi=150)
    plt.close() # Close plot to free memory
    shap_image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    # --- Final Results Dictionary ---
    results = {
        "accuracy": accuracy_score(y_test, y_pred),
        "selection_rate_gap": selection_gap,
        "metrics_by_gender": mf.by_group.to_dict(),
        "bias_flag": is_biased,
        "model_type": model_type,
        "equation": equation_str,
        "coefficients": coef_df.to_dict(orient="records") if coef_df is not None else None,
        "decision_logic": decision_logic,
        "tree_image": tree_image_base64 if model_type == "tree" else None,
        "shap_image": shap_image_base64 # Return the image string
    }

    # --- Force JSON-safe types ---
    results["accuracy"] = float(results["accuracy"])
    results["selection_rate_gap"] = float(results["selection_rate_gap"])
    results["bias_flag"] = bool(results["bias_flag"])

    # metrics_by_gender keys: usually floats/np types → convert deeply
    for group, metrics in results["metrics_by_gender"].items():
        for k, v in metrics.items():
            if isinstance(v, (np.float64, np.float64)):
                results["metrics_by_gender"][group][k] = float(v)
            elif isinstance(v, (np.int_, np.int64)):
                results["metrics_by_gender"][group][k] = int(v)
            elif isinstance(v, np.bool_):
                results["metrics_by_gender"][group][k] = bool(v)

    # coefficients list: convert coef & influence (NumPy types)
    if results["coefficients"] is not None:
        for row in results["coefficients"]:
            if isinstance(row["Coefficient"], (np.float64, np.float64)):
                row["Coefficient"] = float(row["Coefficient"])
            if isinstance(row["Influence"], (np.int_, np.int64, np.float64)):
                row["Influence"] = int(row["Influence"])


    return results