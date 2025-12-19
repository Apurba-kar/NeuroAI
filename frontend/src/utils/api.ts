import axiosInstance from "./axios";

export async function getAllAnalysis(){
    const response = await axiosInstance.get("/analysis/");
    console.log(response.data.analyses);
    return response.data.analyses;
}
export async function getAnalysisById(id: string) {
    const response = await axiosInstance.get(`/analysis/${id}`);
    return response.data.analysis;
}