import { useQuery } from "@tanstack/react-query";
import { BackendService } from "../services/BackendService";
import { MOCK_FALLBACK_RULES } from "../mock/data";
import type { AnalyzeResponse } from "../types/types";

export const useLoanAnalysis = (
  file: File | null,
  modelType: "logistic" | "tree"
) => {
  const query = useQuery<AnalyzeResponse>({
    queryKey: ["loanResults", file, modelType],
    queryFn: () => BackendService.analyzeDataSet(file!, modelType),
    enabled: !!file,
  });

  const data = query.data;

  return {
    loading: query.isLoading,
    coefficients: data?.coefficients,
    rules: data?.decision_logic ?? MOCK_FALLBACK_RULES,
    accuracy: data?.accuracy,
    biasFlag: data?.bias_flag,
    selectionRateGap: data?.selection_rate_gap,
    shapImage: data?.shap_image,
    modelTypeReturned: data?.model_type,
    decisionLogic: data?.decision_logic,
    equation: data?.equation,
    raw: data,
    treeImage: data?.tree_image,
    fairnessSlices: data?.fairness_slices,
  };
};
