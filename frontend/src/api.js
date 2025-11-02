import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store token getter function
let tokenGetter = null;

// Set token getter function (called from App.jsx)
export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

// Add auth token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Request interceptor to add token dynamically
api.interceptors.request.use(
  async (config) => {
    // Try to get fresh token if getter is available
    if (tokenGetter) {
      try {
        const token = await tokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

// ========== PROJECT API ==========

export const createProject = async (name, language) => {
  const response = await api.post("/projects", { name, language });
  return response.data;
};

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

// ========== ANALYSIS API ==========

export const analyzeCode = async (code, language, projectId = null) => {
  const response = await api.post("/analysis", { code, language, projectId });
  return response.data;
};

export const getAnalysis = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const getAnalyses = async (projectId = null, limit = 20, skip = 0) => {
  const params = { limit, skip };
  if (projectId) params.projectId = projectId;

  const response = await api.get("/analysis", { params });
  return response.data;
};

// ========== ANALYTICS API ==========

export const getAnalyticsOverview = async () => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

export const getAnalyticsTrends = async (days = 30) => {
  const response = await api.get("/analytics/trends", { params: { days } });
  return response.data;
};

// ========== REPORTS API ==========

export const generatePDFReport = async (analysisId) => {
  const response = await api.get(`/reports/${analysisId}/pdf`, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `CodeReview-AI-Analysis-${analysisId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  return response.data;
};

export const generateExcelReport = async (analysisId) => {
  const response = await api.get(`/reports/${analysisId}/excel`, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `CodeReview-AI-Analysis-${analysisId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  return response.data;
};

export default api;
