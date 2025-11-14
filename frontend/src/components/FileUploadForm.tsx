import { GLASS_CARD } from "../util/util";
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
    <div className={`p-8 space-y-6 ${GLASS_CARD} w-full mx-auto`}>
      <h2 className='text-3xl font-bold text-white text-center'>
        Start Global Analysis
      </h2>

      <div>
        <label className='block text-gray-300 mb-2'>
          1. Upload Dataset (CSV)
        </label>
        <input
          type='file'
          accept='.csv'
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className='block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-500/10 file:text-blue-400
                        hover:file:bg-blue-500/20'
          required
        />
      </div>

      <div>
        <label className='block text-gray-300 mb-2'>2. Select Model Type</label>
        <ModelToggle modelType={modelType} setModelType={setModelType} />
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed'
      >
        {isLoading ? "Analyzing Data..." : "Run Fairness Analysis"}
      </button>

      {isError && (
        <div className='p-3 bg-red-800/30 text-red-300 rounded-lg text-sm'>
          Error: {error.message}
        </div>
      )}
    </div>
  );
};
