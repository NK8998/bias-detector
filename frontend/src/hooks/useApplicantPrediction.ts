import { useMemo } from "react";
import type { Coefficient } from "../types/types";

export type ApplicantInputs = {
  income: number;
  loanAmount: number;
  credit: number;
  age: number;
  gender_Male: number;
};

export type BackendCoefficient = {
  Feature: string; // backend field name
  Coefficient: number;
  Influence: number;
};

export type NormalizedCoefficient = {
  feature: string;
  coef: number;
  influence: number;
};

export type PredictionResult = {
  prob: number;
  status: "Approved" | "Rejected";
  color: string;
};

// Map backend feature → frontend input key
export const FEATURE_MAP = {
  income_proxy: "income",
  loan_amount: "loanAmount",
  "credit amount": "credit",
  age: "age",
  gender_Male: "gender_Male",
} as const;

type FeatureMapKey = keyof typeof FEATURE_MAP;

export const useApplicantPrediction = (
  inputs: ApplicantInputs,
  coefficients?: Coefficient[]
): PredictionResult => {
  return useMemo(() => {
    if (!coefficients || coefficients.length === 0) {
      return {
        prob: 0,
        status: "Rejected",
        color: "text-red-400",
      };
    }

    let intercept = 0;

    const weightedSum = coefficients.reduce((sum, c) => {
      if (c.Feature === "intercept") {
        intercept = c.Coefficient;
        return sum;
      }

      const mapped = FEATURE_MAP[c.Feature as FeatureMapKey];
      if (!mapped) return sum;

      const raw = inputs[mapped];

      // Scaling logic
      const scaled =
        c.Feature === "income_proxy"
          ? raw / 100000
          : c.Feature === "loan_amount"
          ? raw / 20000
          : c.Feature === "credit amount"
          ? raw / 100
          : c.Feature === "age"
          ? raw / 70
          : raw;

      return sum + c.Coefficient * scaled;
    }, 0);

    const logit = weightedSum + intercept;
    const prob = 1 / (1 + Math.exp(-logit));

    return {
      prob,
      status: prob > 0.5 ? "Approved" : "Rejected",
      color: prob > 0.5 ? "text-green-400" : "text-red-400",
    };
  }, [inputs, coefficients]);
};
