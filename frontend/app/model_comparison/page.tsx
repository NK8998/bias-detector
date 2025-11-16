"use client";

import DataPreviewSection from "@/components/model_comparison/data_preview_section";
import FileUploadSection from "@/components/model_comparison/file_upload_section";
import Navbar from "@/components/reusables/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BackendService } from "@/services/backend_service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ModelComparisonPage() {
  const [fairModelFile, setFairModelFile] = useState<File | null>(null);
  const [biasedModelFile, setBiasedModelFile] = useState<File | null>(null);

  const fairModelDataObj = useQuery({
    queryKey: ["compareModels", fairModelFile],
    queryFn: () =>
      BackendService.predictBulk(fairModelFile!, "logistic_regression", false),
    enabled: !!fairModelFile,
  });

  const biasedModelDataObj = useQuery({
    queryKey: ["compareModels", biasedModelFile],
    queryFn: () =>
      BackendService.predictBulk(biasedModelFile!, "logistic_regression", true),
    enabled: !!biasedModelFile,
  });

  console.log("Fair Model Data:", fairModelDataObj.data);
  console.log("Biased Model Data:", biasedModelDataObj.data);

  return (
    <div className='min-h-screen bg-white text-black pb-12'>
      <Navbar />
      {/* Title */}
      <main className='px-8 max-w-[1400px] mx-auto flex flex-col '>
        <div className='max-w-3xl mb-12 mt-3 w-full'>
          <Card className='bg-white border border-black/10 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-4xl font-bold'>
                Model Comparison
              </CardTitle>
              <CardDescription className='text-gray-700 text-sm leading-relaxed mt-2'>
                Upload two datasets — one balanced and one biased — to compare
                their machine learning performance, fairness metrics, and model
                behavior. This page visualizes how dataset quality directly
                impacts bias.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <FileUploadSection
          fairModelFile={fairModelFile}
          setFairModelFile={setFairModelFile}
          biasedModelFile={biasedModelFile}
          setBiasedModelFile={setBiasedModelFile}
        />
        <DataPreviewSection
          fairModelFile={fairModelFile}
          biasedModelFile={biasedModelFile}
        />
      </main>
    </div>
  );
}
