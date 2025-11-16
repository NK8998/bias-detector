export type FairnessSlice = {
  accuracy: number;
  count: number;
  selection_rate: number;
};

export type FairnessSlices = {
  [feature: string]: {
    [range: string]: FairnessSlice;
  };
};

export type LogisticCoefficient = {
  Feature: string;
  Coefficient: number;
  Influence: number; // 1 or -1
};

export interface BiasReport {
  // Core performance metrics
  accuracies: Record<string, number>;
  overall_accuracy: number;
  approval_rate: number;
  average_probability: number;

  // Bias flags & fairness indicators
  bias_flag: boolean;
  demographic_parity_difference: number;
  statistical_parity_ratio: number;
  selection_rate_gap: number;
  primary_fairness_axis: string;

  // Slices (per-feature and per-range buckets)
  fairness_slices: FairnessSlices;

  // Model introspection
  logistic_equation: string;
  logistic_coefficients: LogisticCoefficient[];
  decision_tree_rules: string | null;

  // Dataset metadata
  sensitive_features: string[];
  columns: string[];
  row_count: number;

  // Mappings (only appears for biased dataset, so optional)
  column_mapping?: Record<string, string>;
  value_mapping?: Record<string, Record<string, number>>;
}
