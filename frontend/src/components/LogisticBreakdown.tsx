import { useMemo } from "react";

export type Coefficient = {
  Feature: string;
  Coefficient: number;
  Influence: number;
};

interface LogisticBreakdownProps {
  decisionLogic?: string;
  coefficients?: Coefficient[];
  equation?: string;
}

export const LogisticBreakdown = ({
  decisionLogic,
  coefficients,
  equation,
}: LogisticBreakdownProps) => {
  if (!coefficients || !equation || !decisionLogic) {
    return (
      <div className='p-4 bg-white border border-gray-400 border-dashed rounded-lg text-gray-800'>
        No data available for breakdown.
      </div>
    );
  }

  const intercept = useMemo(() => {
    const match = equation.match(/([+-]?\d+(\.\d+)?)(?!.*\d)/);
    return match ? parseFloat(match[1]) : 0;
  }, [equation]);

  const { steps, logitP, probability } = useMemo(() => {
    const s = coefficients.map((c) => {
      const inputValue = 1; // placeholder
      const weighted = inputValue * c.Coefficient;

      return {
        feature: c.Feature,
        coef: c.Coefficient,
        influence: c.Influence,
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
    <div className='space-y-8'>
      {/* Title */}
      <h5 className='text-xl font-bold text-black border-b border-gray-300 pb-2'>
        Logistic Regression Breakdown
      </h5>

      {/* Full Equation Card */}
      <div className='p-6 bg-white border border-gray-400 border-dashed rounded-xl shadow-sm'>
        <div className='text-lg font-semibold text-black mb-2'>
          Full Equation
        </div>

        <div className='font-mono text-sm text-gray-700 leading-relaxed'>
          Logit(p) ={" "}
          {coefficients.map((c, i) => (
            <span key={i}>
              {c.Coefficient >= 0 && i > 0 ? " + " : ""}(
              {c.Coefficient.toFixed(3)} × {c.Feature})
            </span>
          ))}{" "}
          {intercept >= 0 ? " + " : " - "}
          {Math.abs(intercept).toFixed(3)}
        </div>

        <p className='mt-3 text-gray-700 text-sm'>
          Each feature pushes the score up or down depending on its coefficient.
        </p>
      </div>

      {/* Feature Contribution Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
        {steps.map((step, idx) => (
          <div
            key={idx}
            className='p-4 bg-white border border-gray-300 border-dashed rounded-lg shadow-sm flex flex-col justify-between'
          >
            <div className='flex justify-between items-center mb-3'>
              <span className='font-semibold text-black text-sm'>
                {step.feature.replace(/_/g, " ").toUpperCase()}
              </span>

              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  step.coef > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {step.coef.toFixed(3)}
              </span>
            </div>

            <div className='text-gray-700 text-xs mb-2'>
              <span className='font-semibold'>Influence Level: </span>
              <span className='font-mono text-blue-700'>{step.influence}</span>
            </div>

            <div className='text-gray-700 text-xs mb-2'>
              Example Input:{" "}
              <span className='font-mono text-blue-700'>
                {step.inputValue.toFixed(2)}
              </span>
            </div>

            <div className='text-sm text-black mt-2'>Contribution:</div>
            <div className='text-xl font-extrabold text-gray-900'>
              {step.sign} {Math.abs(step.weightedValue).toFixed(3)}
            </div>

            <div className='text-xs text-gray-500 mt-1'>
              Larger values indicate stronger impact.
            </div>
          </div>
        ))}
      </div>

      {/* Summary Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300'>
        {/* Logit Summary */}
        <div className='p-6 bg-white border border-gray-400 border-dashed rounded-xl shadow-sm'>
          <div className='text-lg text-gray-700'>
            Total Linear Score (Logit(p))
          </div>
          <div className='text-4xl font-extrabold text-blue-700 mt-2'>
            {logitP.toFixed(3)}
          </div>
          <p className='text-sm text-gray-600 mt-2'>
            Combined effect of all feature contributions + intercept.
          </p>
        </div>

        {/* Probability Summary */}
        <div className='p-6 bg-white border border-gray-400 border-dashed rounded-xl shadow-sm'>
          <div className='text-lg text-gray-700'>Final Probability (P)</div>
          <div className='text-5xl font-extrabold text-green-700 mt-2'>
            {(probability * 100).toFixed(1)}%
          </div>
          <p className='text-sm text-gray-600 mt-2'>
            Logistic function converting the score into a probability.
          </p>
        </div>
      </div>
    </div>
  );
};
