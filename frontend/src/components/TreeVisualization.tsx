import React from "react";

export interface ApplicantInputs {
  income: number;
  loanAmount: number;
  credit: number;
  age: number;
  gender_Male: number; // 0 or 1
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

  // Constants (can be pulled from API later)
  const creditThreshold = 60;
  const incomeThreshold = 55000;
  const loanThreshold = 10000;

  // ---- Decision Path ----
  if (inputs.credit >= creditThreshold) {
    path.push({
      rule: `Credit Score ≥ ${creditThreshold}`,
      result: "True",
      value: inputs.credit,
    });

    if (inputs.income >= incomeThreshold) {
      path.push({
        rule: `Income ≥ $${incomeThreshold / 1000}k`,
        result: "True",
        value: inputs.income,
      });
      prediction = "Approved";
    } else {
      path.push({
        rule: `Income ≥ $${incomeThreshold / 1000}k`,
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
    // This branch always rejects regardless of loanAmount
    prediction = "Rejected";
  }

  return (
    <div className='space-y-6'>
      <h5 className='text-xl font-bold text-blue-300 border-b border-blue-600/50 pb-2'>
        Decision Path Flowchart (If/Then Logic)
      </h5>

      {/* Decision Tree Text */}
      <div className='p-4 bg-gray-800 rounded-lg text-sm font-mono text-gray-300  overflow-y-auto'>
        <pre>
          {decisionLogicText || "Decision tree structure not available."}
        </pre>
      </div>

      {/*Visual tree path*/}
      <div className='w-full '>
        <h5 className='text-xl font-bold text-blue-300 border-b border-blue-600/50 pb-2'>
          Decision Path Visualization
        </h5>
        <img
          src={`data:image/png;base64,${treeImageBase64}`}
          alt='SHAP Summary Plot'
          className='max-w-full h-auto'
        />
      </div>

      <p className='text-gray-400 text-sm'>
        Below shows the path the current applicant takes:
      </p>

      {/* Visual Path */}
      {path.map((step, index) => (
        <div key={index} className='flex items-start space-x-4'>
          <div className='flex flex-col items-center'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10 ${
                step.result === "True" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {step.result === "True" ? "✓" : "✗"}
            </div>

            {index < path.length - 1 && (
              <div className='w-1 bg-gray-700 h-12'></div>
            )}
          </div>

          <div
            className={`p-4 flex-1 border rounded-xl ${
              step.result === "True"
                ? "border-green-400 bg-green-600/10"
                : "border-red-400 bg-red-600/10"
            }`}
          >
            <p className='text-sm text-gray-400'>Rule {index + 1}:</p>
            <p className='font-semibold text-white'>
              {step.rule} (Applicant Value: {step.value.toFixed(0)})
            </p>

            <span
              className={`text-xs font-mono mt-1 inline-block px-3 py-1 rounded-full ${
                step.result === "True"
                  ? "bg-green-600/30 text-green-300"
                  : "bg-red-600/30 text-red-300"
              }`}
            >
              Result: {step.result}
            </span>
          </div>
        </div>
      ))}

      {/* Final Decision */}
      <div className='mt-8 p-6 text-center rounded-2xl bg-gradient-to-r from-teal-800/30 to-blue-800/30 border border-teal-500/50'>
        <p className='text-lg text-gray-300'>Final Decision</p>
        <p
          className={`text-5xl font-extrabold mt-2 ${
            prediction === "Approved" ? "text-teal-400" : "text-red-400"
          }`}
        >
          {prediction}
        </p>
      </div>
    </div>
  );
};
