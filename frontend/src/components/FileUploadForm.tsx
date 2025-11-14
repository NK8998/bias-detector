import { ModelToggle } from "./ModelToggle";
import { useQuery } from "@tanstack/react-query";
import { BackendService } from "../services/BackendService";
import type { AnalyzeResponse } from "../types/types";

interface FileUploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  modelType: "logistic" | "tree";
  setModelType: (type: "logistic" | "tree") => void;
}

export const FileUploadForm = ({
  file,
  setFile,
  modelType,
  setModelType,
}: FileUploadFormProps) => {
  const { isLoading, isError, error } = useQuery<AnalyzeResponse>({
    queryKey: ["loanResults", file, modelType],
    queryFn: () => BackendService.analyzeDataSet(file!, modelType),
    enabled: !!file,
  });

  return (
    <div className='p-8 space-y-6 bg-white border border-gray-400 border-dashed rounded-xl shadow-sm w-full mx-auto'>
      <h2 className='text-3xl font-bold text-black text-center'>
        Start Global Analysis
      </h2>

      {/* File Upload */}
      <div>
        <label className='block text-gray-700 mb-2'>
          1. Upload Dataset (CSV)
        </label>

        <input
          type='file'
          accept='.csv'
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className='
            block w-full text-sm text-gray-800
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border file:border-gray-300
            file:bg-gray-100 file:text-gray-700
            hover:file:bg-gray-200
          '
          required
        />
      </div>

      {/* Model Type */}
      <div>
        <label className='block text-gray-700 mb-2'>2. Select Model Type</label>
        <ModelToggle modelType={modelType} setModelType={setModelType} />
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={isLoading}
        className='
          w-full py-3 rounded-md bg-black text-white font-semibold
          hover:bg-gray-900 transition-colors
          disabled:bg-gray-600 disabled:cursor-not-allowed
        '
      >
        {isLoading ? "Analyzing Data..." : "Run Fairness Analysis"}
      </button>

      {/* Error */}
      {isError && (
        <div className='p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300'>
          Error: {error?.message}
        </div>
      )}
    </div>
  );
};
