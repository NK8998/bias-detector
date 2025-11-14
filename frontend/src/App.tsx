import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ModelToggle } from "./components/ModelToggle";
import { FileUploadForm } from "./components/FileUploadForm";
import { ApplicantSliders } from "./components/ApplicantSliders";
import { LogisticBreakdown } from "./components/LogisticBreakdown";
import { TreeVisualization } from "./components/TreeVisualization";
import { useLoanAnalysis } from "./hooks/useLoanAnalysis";
import { useApplicantPrediction } from "./hooks/useApplicantPrediction";
import FairnessSlicesResults from "./components/FairnessSlicesResults";
import { FairnessMetricsExplanation } from "./components/FairnessMetricsExplanation";

const App = () => {
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

  return (
    <div className='min-h-screen w-full bg-white text-black flex'>
      <Sidebar />

      <div className='flex-1  p-6 sm:p-10 mx-auto'>
        {/* Header */}
        <header className='mb-10 flex justify-between items-center  top-0 bg-white/95 z-20 pt-4 pb-4 border-b border-gray-300'>
          <h2 className='text-3xl font-extrabold'>Loan Fairness Predictor</h2>
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

          {/* Global Metrics */}
          <section id='global'>
            <h2 className='text-3xl font-semibold pb-2  border-gray-300'>
              Global Model Performance
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {/* Accuracy */}
              <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 text-center'>
                <p className='text-gray-600'>Accuracy</p>
                <p className='text-5xl text-black font-bold'>
                  {analysis.accuracy?.toFixed(2)}
                </p>
              </div>

              {/* Model Type */}
              <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 text-center'>
                <p className='text-gray-600'>Model Type</p>
                <p className='text-5xl text-black font-bold'>
                  {analysis.modelTypeReturned?.toUpperCase()}
                </p>
              </div>

              {/* Bias */}
              <div
                className={`bg-gray-100 border rounded-lg p-6 text-center ${
                  analysis.biasFlag ? "border-red-500" : "border-green-500"
                }`}
              >
                <p className='text-gray-600'>Bias Status</p>
                <p
                  className={`text-5xl font-bold ${
                    analysis.biasFlag ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {analysis.biasFlag ? "BIAS DETECTED" : "FAIR"}
                </p>
              </div>
            </div>
          </section>

          {/* Logic Breakdown */}
          <section id='logic'>
            <h2 className='text-3xl font-semibold pb-2  border-gray-300'>
              {modelType === "logistic"
                ? "Linear Model Breakdown"
                : "Decision Tree Path"}
            </h2>

            <div className='p-6 bg-gray-100 border border-gray-300 rounded-lg'>
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

          {/* Fairness Check */}
          <section id='fairness'>
            <h2 className='text-3xl font-semibold pb-2  border-gray-300'>
              Fairness Check
            </h2>
            <div className='mt-2 mb-2'>
              <FairnessMetricsExplanation />
            </div>
            <div className='p-6 bg-gray-100 border border-gray-300 rounded-lg'>
              {/* Placeholder for Fairness Slices Results */}
              <FairnessSlicesResults fairnessSlices={analysis.fairnessSlices} />
            </div>
          </section>

          {/* SHAP */}
          <section id='shap'>
            <h2 className='text-3xl font-semibold pb-2 border-b border-gray-300'>
              SHAP Plot
            </h2>

            <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 flex justify-center'>
              {analysis.shapImage ? (
                <img
                  src={`data:image/png;base64,${analysis.shapImage}`}
                  alt='SHAP Summary Plot'
                  className='max-w-full h-auto'
                />
              ) : (
                <p className='text-gray-600'>No SHAP plot available.</p>
              )}
            </div>
          </section>

          {/* Applicant */}
          <section id='applicant'>
            <div className='flex justify-between items-center pb-2  border-gray-300 mb-2'>
              <h2 className='text-3xl font-semibold '>Test Applicant Inputs</h2>

              <div className='text-2xl font-bold'>
                Decision:{" "}
                <span className={prediction.color}>{prediction.status}</span>
                <span className='ml-2 text-gray-600 text-lg'>
                  ({(prediction.prob * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            <ApplicantSliders inputs={inputs} setInputs={setInputs} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
