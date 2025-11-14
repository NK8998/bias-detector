// Mock data structure fallback (Used for local Applicant Sliders only)
const MOCK_FALLBACK_COEFFICIENTS = [
  { feature: "income_proxy", coef: 0.45, influence: 1 },
  { feature: "loan_amount", coef: -0.3, influence: -1 },
  { feature: "credit_score", coef: 0.6, influence: 1 },
  { feature: "age", coef: -0.1, influence: -1 },
  { feature: "gender_Male", coef: -0.25, influence: -1 },
  { feature: "intercept", coef: 0.15, influence: 1 },
];

const MOCK_FALLBACK_RULES = [
  { condition: "Credit Score > 500", branch: "YES", prediction: "High Risk" },
  { condition: "Income Proxy > 0.5", branch: "YES", prediction: "Approved" },
];

export { MOCK_FALLBACK_COEFFICIENTS, MOCK_FALLBACK_RULES };
