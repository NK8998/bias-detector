import React from "react";

export interface ApplicantInputs {
  income: number;
  loanAmount: number;
  credit: number;
  age: number;
  gender_Male: number;
}

export interface TreeRuleStep {
  rule: string;
  result: "True" | "False";
  value: number;
}

interface TreeVisualizationProps {
  inputs: ApplicantInputs;
  treeImageBase64?: string;
  decisionLogicText?: string;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  inputs,
  treeImageBase64,
  decisionLogicText,
}) => {
  const path: TreeRuleStep[] = [];
  let prediction: "Approved" | "Rejected" = "Rejected";

  // Thresholds (can be API controlled later)
  const creditThreshold = 60;
  const incomeThreshold = 55000;
  const loanThreshold = 10000;

  // Build Decision Path
  if (inputs.credit >= creditThreshold) {
    path.push({
      rule: `Credit Score ≥ ${creditThreshold}`,
      result: "True",
      value: inputs.credit,
    });

    if (inputs.income >= incomeThreshold) {
      path.push({
        rule: `Income ≥ ${incomeThreshold}`,
        result: "True",
        value: inputs.income,
      });
      prediction = "Approved";
    } else {
      path.push({
        rule: `Income ≥ ${incomeThreshold}`,
        result: "False",
        value: inputs.income,
      });
      prediction = inputs.loanAmount <= loanThreshold ? "Approved" : "Rejected";
    }
  } else {
    path.push({
      rule: `Credit Score ≥ ${creditThreshold}`,
      result: "False",
      value: inputs.credit,
    });
    prediction = "Rejected";
  }

  return (
    <div className='space-y-6 text-black'>
      {/* Header */}
      <h5 className='text-xl font-semibold border-b border-gray-300 pb-2'>
        Decision Path (If / Then Evaluation)
      </h5>

      {/* Decision Tree Text */}
      <div className='p-4 bg-gray-100 rounded border border-gray-300 text-sm font-mono text-black'>
        <pre className='whitespace-pre-wrap'>
          {decisionLogicText || "Decision tree structure not available."}
        </pre>
      </div>

      {/* Decision Tree Image */}
      <div>
        <h5 className='text-xl font-semibold border-b border-gray-300 pb-2'>
          Decision Tree Visualization
        </h5>

        {treeImageBase64 ? (
          <img
            src={`data:image/png;base64,${treeImageBase64}`}
            alt='Decision Tree'
            className='max-w-full h-auto mt-4 border border-gray-300 rounded'
          />
        ) : (
          <p className='text-gray-600 mt-2 text-sm'>
            Decision tree image not available.
          </p>
        )}
      </div>

      {/* Path Intro */}
      <p className='text-gray-600 text-sm'>
        Below is the exact path taken for this applicant:
      </p>

      {/* Visual Path */}
      {path.map((step, index) => (
        <div key={index} className='flex items-start space-x-4 pb-6 last:pb-0'>
          {/* Left Column: Step marker */}
          <div className='flex flex-col items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                ${step.result === "True" ? "bg-green-600" : "bg-red-600"}`}
            >
              {step.result === "True" ? "✓" : "✗"}
            </div>

            {index < path.length - 1 && (
              <div className='w-1 flex-1 bg-gray-400 mt-1' />
            )}
          </div>

          {/* Right Column: Card */}
          <div
            className={`p-4 flex-1 rounded border text-sm
              ${
                step.result === "True" ? "border-green-600" : "border-red-600"
              }`}
          >
            <p className='text-xs text-gray-600'>Rule {index + 1}</p>

            <p className='font-medium mt-1'>
              {step.rule}
              <span className='text-gray-500'>
                {" "}
                (Applicant Value: {step.value})
              </span>
            </p>

            <span
              className={`inline-block mt-2 px-3 py-1 text-xs rounded-full border
                ${
                  step.result === "True"
                    ? "border-green-600 text-green-700"
                    : "border-red-600 text-red-700"
                }`}
            >
              {step.result === "True" ? "Approved" : "Rejected"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
