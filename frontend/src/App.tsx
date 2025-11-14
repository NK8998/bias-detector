import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ModelToggle } from "./components/ModelToggle";
import { FileUploadForm } from "./components/FileUploadForm";
import { ApplicantSliders } from "./components/ApplicantSliders";
import { LogisticBreakdown } from "./components/LogisticBreakdown";
import { TreeVisualization } from "./components/TreeVisualization";
import { computeSelectionRates, GLASS_CARD } from "./util/util";

import { useLoanAnalysis } from "./hooks/useLoanAnalysis";
import { useApplicantPrediction } from "./hooks/useApplicantPrediction";

const App = () => {
  // --- Local state ---
  const [file, setFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState<"logistic" | "tree">("logistic");

  const [inputs, setInputs] = useState({
    income: 55000,
    loanAmount: 8000,
    credit: 65,
    age: 35,
    gender_Male: 0,
  });

  const analysis = useLoanAnalysis(file, modelType);

  const prediction = useApplicantPrediction(inputs, analysis.coefficients);

  const selectionRates = computeSelectionRates(analysis.metricsByGender);

  const sections = [
    { id: "applicant", name: "Test Applicant" },
    { id: "logic", name: "Decision Breakdown" },
    { id: "global", name: "Global Metrics" },
    { id: "fairness", name: "Fairness Check" },
    { id: "shap", name: "SHAP Plot" },
  ];

  return (
    <div className='min-h-screen w-full bg-gray-900 text-white flex'>
      <Sidebar sections={sections} />

      <div className='flex-1 lg:ml-64 p-6 sm:p-10'>
        {/* Header */}
        <header className='mb-10 flex justify-between items-center sticky top-0 bg-gray-900/90 z-20 pt-4 pb-4 border-b border-gray-800'>
          <h1 className='text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400'>
            Loan Fairness Predictor
          </h1>
          <ModelToggle modelType={modelType} setModelType={setModelType} />
        </header>

        <main className='space-y-12'>
          {/* File Upload */}
          <div className='flex-1 w-full flex justify-center items-center'>
            <FileUploadForm
              file={file}
              setFile={setFile}
              modelType={modelType}
              setModelType={setModelType}
            />
          </div>

          {/* Applicant */}
          <section id='applicant'>
            <div className='flex justify-between items-center pb-2 border-b border-gray-700'>
              <h2 className='text-3xl font-semibold'>Test Applicant Inputs</h2>
              <div className='text-2xl font-bold'>
                Decision:{" "}
                <span className={prediction.color}>{prediction.status}</span>
                <span className='ml-2 text-gray-400 text-lg'>
                  ({(prediction.prob * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            <ApplicantSliders inputs={inputs} setInputs={setInputs} />
          </section>

          {/* Logic Breakdown */}
          <section id='logic'>
            <h2 className='text-3xl font-semibold pb-2 border-b border-gray-700'>
              {modelType === "logistic"
                ? "Linear Model Breakdown"
                : "Decision Tree Path"}
            </h2>

            <div className={`p-6 bg-gray-800/50 rounded-xl`}>
              {modelType === "logistic" ? (
                <LogisticBreakdown
                  decisionLogic={analysis?.decisionLogic}
                  coefficients={analysis?.coefficients}
                  equation={analysis?.equation}
                />
              ) : (
                <TreeVisualization
                  inputs={inputs}
                  treeImageBase64={analysis.treeImage}
                  decisionLogicText={analysis.raw?.decision_logic}
                />
              )}
            </div>
          </section>

          {/* Global Metrics */}
          <section id='global'>
            <h2 className='text-3xl font-semibold pb-2 border-b border-gray-700'>
              Global Model Performance
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className={`${GLASS_CARD} p-6 text-center`}>
                <p className='text-gray-400'>Accuracy</p>
                <p className='text-5xl text-blue-400 font-bold'>
                  {analysis.accuracy?.toFixed(2)}
                </p>
              </div>

              <div className={`${GLASS_CARD} p-6 text-center`}>
                <p className='text-gray-400'>Model Type</p>
                <p className='text-5xl text-teal-400 font-bold'>
                  {analysis.modelTypeReturned?.toUpperCase()}
                </p>
              </div>

              <div
                className={`${GLASS_CARD} p-6 text-center ${
                  analysis.biasFlag
                    ? "border-red-500/40"
                    : "border-green-500/40"
                }`}
              >
                <p className='text-gray-400'>Bias Status</p>
                <p
                  className={`text-5xl font-bold ${
                    analysis.biasFlag ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {analysis.biasFlag ? "BIAS DETECTED" : "FAIR"}
                </p>
              </div>
            </div>
          </section>

          {/* Fairness */}
          <section id='fairness'>
            <h2 className='text-3xl font-semibold pb-2 border-b border-gray-700'>
              Gender Fairness Check
            </h2>

            <div className={`${GLASS_CARD} p-6`}>
              <div className='flex justify-between items-center text-lg font-medium mb-4'>
                <span>Selection Rate Gap</span>
                <span
                  className={`text-4xl font-bold ${
                    analysis.biasFlag ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {((analysis?.selectionRateGap ?? 0) * 100).toFixed(1)}%
                </span>
              </div>

              <div className='space-y-6 mt-6'>
                {selectionRates.map((item) => (
                  <div key={item.group}>
                    <div className='flex justify-between mb-1'>
                      <span className='font-semibold text-gray-300'>
                        {item.group}
                      </span>
                      <span className='font-mono text-lg'>
                        {(item.rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className='h-4 bg-gray-700 rounded-full overflow-hidden'>
                      <div
                        style={{ width: `${item.rate * 100}%` }}
                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-700`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SHAP */}
          <section id='shap'>
            <h2 className='text-3xl font-semibold pb-2 border-b border-gray-700'>
              SHAP Plot
            </h2>

            <div className={`${GLASS_CARD} p-6 flex justify-center`}>
              {analysis.shapImage ? (
                <img
                  src={`data:image/png;base64,${analysis.shapImage}`}
                  alt='SHAP Summary Plot'
                  className='max-w-full h-auto'
                />
              ) : (
                <p className='text-gray-500'>No SHAP plot available.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
