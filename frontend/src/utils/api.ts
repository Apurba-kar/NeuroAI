import axiosInstance from "./axios";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  role: "user" | "admin";
  institution?: string;
  fullName: string;
}

export interface ScanInformation {
  modality?: string;
  body_region?: string;
  plane_sequence?: string;
  contrast?: string;
  technical_notes?: string;
}

export interface Abnormality {
  description?: string;
  location?: string;
  size?: string;
  size_or_extent?: string;
  morphology?: string;
  density?: string;
  density_or_signal?: string;
  hemodynamics?: string;
  hemodynamics_or_function?: string;
  associated_changes?: string;
}

export interface KeyFindings {
  abnormalities?: Abnormality[];
  normal_findings?: string;
}

export interface ClinicalObservations {
  likely_diagnosis?: string;
  differential_diagnosis?: string[];
  clinical_relevance?: string;
}

export interface Recommendations {
  further_imaging?: string[];
  laboratory_tests?: string[];
  referral?: string[];
  urgency?: "routine" | "high" | "urgent" | string;
}

export interface GeminiReport {
  scan_information?: ScanInformation;
  key_findings?: KeyFindings;
  clinical_observations?: ClinicalObservations;
  recommendations?: Recommendations;
}

export interface AnalysisResults {
  disclaimer?: string;
  report?: GeminiReport;
}

export interface AnalysisData {
  patientName?: string;
  patientId?: string;
  patientSex?: string;
  patientBirthDate?: string;
  studyDate?: string;
  studyTime?: string;
  modality?: string;
  manufacturer?: string;
  institutionName?: string;
  studyDescription?: string;
  seriesDescription?: string;
  [key: string]: any;
}

export interface Analysis {
  id: string;
  _id: string;
  mimeType: string;
  format?: string;
  cloudinaryImageUrl: string;
  originalImageUrl: string;
  data: AnalysisData;
  analysisResults: GeminiReport; // Wait, backend does parsedResponse.PROMPT.report || {} in analysisResults, or sometimes nested
  status: "pending" | "completed" | "failed";
  uploadedAt: string;
  user: User;
}

// Authentication API
export const authApi = {
  async signup(data: any): Promise<User> {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data.data.user;
  },

  async login(data: any): Promise<User> {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data.data.user;
  },

  async getMe(): Promise<User> {
    const response = await axiosInstance.get("/auth/me");
    return response.data.user;
  },

  async logout(): Promise<void> {
    await axiosInstance.get("/auth/logout");
  },

  async forgotPassword(email: string): Promise<any> {
    const response = await axiosInstance.post("/auth/forgotPassword", { email });
    return response.data;
  },

  async resetPassword(token: string, data: any): Promise<User> {
    const response = await axiosInstance.patch(`/auth/resetPassword/${token}`, data);
    return response.data.data.user;
  },

  async updatePassword(data: any): Promise<User> {
    const response = await axiosInstance.patch("/auth/updatePassword", data);
    return response.data.data.user;
  }
};

// User Profile API
export const userApi = {
  async updateMe(data: any): Promise<User> {
    const response = await axiosInstance.patch("/user/updateMe", data);
    return response.data.data.user;
  },
  
  async getMe(): Promise<User> {
    const response = await axiosInstance.get("/user/me");
    return response.data.data.user;
  }
};

// Analysis API
export const analysisApi = {
  async getAll(archived = false): Promise<Analysis[]> {
    const response = await axiosInstance.get(`/analysis/${archived ? "?archived=true" : ""}`);
    return response.data.analyses || [];
  },

  async getOne(id: string): Promise<Analysis> {
    const response = await axiosInstance.get(`/analysis/${id}`);
    return response.data.analysis;
  },

  async upload(file: File, onUploadProgress?: (progressEvent: any) => void): Promise<Analysis> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/analysis/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data.analysis;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/analysis/${id}`);
  },

  async archive(id: string): Promise<Analysis> {
    const response = await axiosInstance.patch(`/analysis/${id}/archive`);
    return response.data.analysis;
  },

  async unarchive(id: string): Promise<Analysis> {
    const response = await axiosInstance.patch(`/analysis/${id}/unarchive`);
    return response.data.analysis;
  }
};

// Report API
export const reportApi = {
  async download(analysisId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/analysis/${analysisId}/results`, {
      responseType: "blob",
    });
    return new Blob([response.data], { type: "application/pdf" });
  }
};