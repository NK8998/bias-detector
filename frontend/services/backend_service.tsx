import { BiasReport, TestApplicantResult } from "@/types";
import axios, { Axios, AxiosResponse } from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
});

export const BackendService = {
  predictBulk: async (
    file: File,
    modelType: string,
    biasFlag: boolean
  ): Promise<BiasReport> => {
    try {
      if (!file) {
        return Promise.reject("No file provided");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model_type", modelType);
      formData.append("bias_flag", biasFlag.toString());

      const response: AxiosResponse<BiasReport> = await axiosInstance.post(
        "/predict-bulk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in predictBulk:", error);
      return Promise.reject(error);
    }
  },
  predictSingle: async (
    applicantData: any,
    modelType: string,
    biasFlag: boolean
  ): Promise<TestApplicantResult> => {
    try {
      const response: AxiosResponse<TestApplicantResult> =
        await axiosInstance.post("/predict-single", {
          applicant_data: applicantData,
          model_type: modelType,
          bias_flag: biasFlag,
        });
      return response.data;
    } catch (error) {
      console.error("Error in predictSingle:", error);
      return Promise.reject(error);
    }
  },
};
