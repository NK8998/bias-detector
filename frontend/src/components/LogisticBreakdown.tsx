import { GLASS_CARD } from "../util/util";
import { useMemo } from "react";

export type Coefficient = {
  Feature: string; // from backend
  Coefficient: number;
  Influence: number;
};

interface LogisticBreakdownProps {
  decisionLogic?: string;
  coefficients?: Coefficient[];
  equation?: string;
  // optionally: applicantInputs if needed later
}

export const LogisticBreakdown = ({
  decisionLogic,
  coefficients,
  equation,
}: LogisticBreakdownProps) => {
  if (!coefficients || !equation || !decisionLogic) {
    return <div>No data available for breakdown.</div>;
  }

  // Extract intercept from equation string (last number)
  const intercept = useMemo(() => {
    const match = equation.match(/([+-]?\d+(\.\d+)?)(?!.*\d)/);
    return match ? parseFloat(match[1]) : 0;
  }, [equation]);

  // Compute contributions, logit(p), and p
  const { steps, logitP, probability } = useMemo(() => {
    const s = coefficients.map((c) => {
      // 🔥 For now, logistic breakdown uses inputValue = 1
      // Later you'll plug in applicantInputs and scale properly.
      const inputValue = 1;

      const weighted = inputValue * c.Coefficient;

      return {
        feature: c.Feature,
        coef: c.Coefficient,
        inputValue,
        weightedValue: weighted,
        sign: c.Coefficient >= 0 ? "+" : "-",
      };
    });

    const linearSum =
      s.reduce((acc, curr) => acc + curr.weightedValue, 0) + intercept;

    const p = 1 / (1 + Math.exp(-linearSum));

    return { steps: s, logitP: linearSum, probability: p };
  }, [coefficients, intercept]);

  return (
    <div className='space-y-6'>
      <h5 className='text-xl font-bold text-blue-300 border-b border-blue-600/50 pb-2'>
        Logistic Regression Breakdown
      </h5>

      {/* Feature contribution cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-4 ${GLASS_CARD} flex flex-col justify-between`}
          >
            <div className='flex justify-between items-center mb-2'>
              <span className='font-semibold text-white text-sm'>
                {step.feature.replace(/_/g, " ").toUpperCase()}
              </span>

              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  step.coef > 0
                    ? "bg-green-600/30 text-green-300"
                    : "bg-red-600/30 text-red-300"
                }`}
              >
                {step.coef.toFixed(3)}
              </span>
            </div>

            <div className='text-gray-300 text-xs mb-1'>
              Input:{" "}
              <span className='font-mono text-blue-400'>
                {step.inputValue.toFixed(2)}
              </span>
            </div>

            <div className='text-xl font-extrabold mt-1'>
              {step.sign} {Math.abs(step.weightedValue).toFixed(3)} Points
            </div>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700'>
        <div className={`${GLASS_CARD} p-6 bg-blue-900/10`}>
          <div className='text-lg text-gray-400'>
            Total Linear Score (Logit(p))
          </div>
          <div className='text-4xl font-extrabold text-blue-400 mt-2'>
            {logitP.toFixed(3)}
          </div>
          <p className='text-sm text-gray-500 mt-1'>
            Logit(p) = Σ(Feature×Coef) + Intercept{" "}
            <span className='font-mono'>({intercept.toFixed(3)})</span>
          </p>
        </div>

        <div className={`${GLASS_CARD} p-6 bg-blue-900/20`}>
          <div className='text-lg text-gray-400'>Final Probability (P)</div>
          <div className='text-5xl font-extrabold text-green-400 mt-2'>
            {(probability * 100).toFixed(1)}%
          </div>
          <p className='text-sm text-gray-500 mt-1'>
            P = 1 / (1 + e<sup>-Logit(p)</sup>)
          </p>
        </div>
      </div>
    </div>
  );
};
