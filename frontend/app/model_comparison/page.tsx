"use client";

import ConclusionSection from "@/components/model_comparison/conclusion_section";
import DataPreviewSection from "@/components/model_comparison/data_preview_section";
import FairnessSlicesSection from "@/components/model_comparison/fairness_slices_section";
import FileUploadSection from "@/components/model_comparison/file_upload_section";
import EquationsBreakdownSection from "@/components/model_comparison/model_equations_section";
import ModelMetricsSection from "@/components/model_comparison/model_metrics_section";
import VisualizeDatasetsSection from "@/components/model_comparison/visualize_datasets_section";
import Footer from "@/components/reusables/footer";
import Navbar from "@/components/reusables/navbar";
import { Separator } from "@/components/ui/separator"; // Import Separator for visual break
import { useAppContext } from "@/context/app_context";
import { BackendService } from "@/services/backend_service";
import { useQuery } from "@tanstack/react-query";

export default function ModelComparisonPage() {
  const {
    fairModelFile,
    setFairModelFile,
    biasedModelFile,
    setBiasedModelFile,
  } = useAppContext();

  const fairModelDataObj = useQuery({
    queryKey: ["compareModels", fairModelFile, "fair"],
    queryFn: () =>
      BackendService.predictBulk(fairModelFile!, "logistic_regression", false),
    enabled: !!fairModelFile,
  });

  const biasedModelDataObj = useQuery({
    queryKey: ["compareModels", biasedModelFile, "biased"],
    queryFn: () =>
      BackendService.predictBulk(biasedModelFile!, "logistic_regression", true),
    enabled: !!biasedModelFile,
  });

  console.log("Fair Model Data:", fairModelDataObj.data);
  console.log("Biased Model Data:", biasedModelDataObj.data);

  return (
    <div className='min-h-screen bg-gray-50 font-sans text-black'>
      <Navbar />
      {/* Introduction Section - Visual Boost */}
      <header className='bg-white   border-gray-100 mb-10'>
        <div className='px-8 max-w-[1300px] mx-auto py-10'>
          <h1 className='text-5xl font-extrabold text-gray-900 tracking-tight mb-3'>
            ⚖️ Model Bias Comparison
          </h1>
          <p className='text-xl text-gray-600 max-w-4xl'>
            A hands-on demonstration of <b>algorithmic bias</b> originating from
            training data. Upload a <b>Fair</b> (balanced) and a <b>Biased</b>
            (skewed) dataset to train two separate models.
          </p>
          {/* <div className='mt-5 pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-500 max-w-4xl'>
              This tool trains two identical <b>Logistic Regression</b> models
              but on distinct datasets. It then generates and compares their
              performance (e.g., Accuracy) and crucial <b>Fairness Metrics</b>
              (e.g., Disparate Impact Ratio), showing how data quality directly
              affects model equity and outcomes for different groups.
            </p>
          </div> */}
        </div>
      </header>
      {/* End Introduction Section */}

      <main className='px-8 max-w-[1300px] mx-auto flex flex-col'>
        <FileUploadSection
          fairModelFile={fairModelFile}
          setFairModelFile={setFairModelFile}
          biasedModelFile={biasedModelFile}
          setBiasedModelFile={setBiasedModelFile}
        />

        <Separator className='my-8 bg-gray-200' />

        <ModelMetricsSection
          fairModelDataObj={fairModelDataObj.data}
          biasedModelDataObj={biasedModelDataObj.data}
        />

        <Separator className='my-8 bg-gray-200' />

        <DataPreviewSection
          fairModelFile={fairModelFile}
          biasedModelFile={biasedModelFile}
        />

        <Separator className='my-8 bg-gray-200' />

        <VisualizeDatasetsSection
          fairModelFile={fairModelFile ?? undefined}
          biasedModelFile={biasedModelFile ?? undefined}
        />

        <Separator className='my-8 bg-gray-200' />

        <EquationsBreakdownSection
          fairEquation={fairModelDataObj.data?.logistic_equation || ""}
          biasedEquation={biasedModelDataObj.data?.logistic_equation || ""}
        />

        <Separator className='my-8 bg-gray-200' />

        <FairnessSlicesSection
          FairModelSlices={fairModelDataObj.data?.fairness_slices}
          BiasedModelSlices={biasedModelDataObj.data?.fairness_slices}
        />

        <Separator className='my-8 bg-gray-200' />

        <ConclusionSection />
      </main>
      <Footer />
    </div>
  );
}
