export type Coefficient = {
  feature: string;
  coefficient: number;
  influence: number;
};

export interface AnalyzeResponse {
  accuracy: number;
  selection_rate_gap: number;
  bias_flag: boolean;
  model_type: "logistic" | "tree";
  equation?: string;
  coefficients?: Coefficient[];
  decision_logic: string;
  shap_image: string;
  error?: string;
  metrics_by_gender: Record<
    string,
    {
      selection_rate: number;
      accuracy: number;
    }
  >;
  tree_image?: string;
}
