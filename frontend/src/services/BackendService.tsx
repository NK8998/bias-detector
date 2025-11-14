import axios, { type AxiosResponse } from "axios";
import type { AnalyzeResponse } from "../types/types";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
});

export const BackendService = {
  analyzeDataSet: async (
    file?: File,
    modelType?: string
  ): Promise<AnalyzeResponse> => {
    if (!file || !modelType)
      return Promise.reject("File and model type are required");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model_type", modelType);
      const res: AxiosResponse<AnalyzeResponse> = await axiosInstance.post(
        "/analyze",
        formData
      );
      return res.data;
    } catch (error) {
      console.error("Error in analyzeDataSet:", error);
      return Promise.reject(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  },
};
