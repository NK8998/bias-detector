export interface Coefficient {
  Feature: string;
  Coefficient: number;
  Influence: number;
}

export interface FairnessGroupMetrics {
  accuracy: Record<string, number>;
  selection_rate: Record<string, number>;
}

export interface FairnessSlice {
  average_odds_difference: number | null;
  demographic_parity_difference: number | null;
  equal_opportunity_difference: number | null;
  selection_rate_gap: number | null;
  statistical_parity_ratio: number | null;
  by_group: FairnessGroupMetrics;
}

export interface AnalyzeResponse {
  accuracy: number;
  average_odds_difference: number | null;
  bias_flag: boolean;
  coefficients: Coefficient[];
  decision_logic: string;
  demographic_parity_difference: number | null;
  equal_opportunity_difference: number | null;
  equation: string;
  fairness_slices: Record<string, FairnessSlice>;
  tree_image?: string;
  shap_image?: string;
  model_type: string;
  selection_rate_gap: number;
}
