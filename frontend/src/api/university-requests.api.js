import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/university-requests",
  withCredentials: true,
});

export const submitUniversityRequest = async (payload) => {
  const response = await API.post("/submit", payload);
  return response.data;
};

export const uploadUniversityLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  const response = await API.post("/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMyUniversityRequests = async (page = 1, limit = 20) => {
  const response = await API.get("/my-requests", {
    params: { page, limit },
  });
  return response.data;
};

export const getAllUniversityRequests = async (
  page = 1,
  limit = 20,
  status = "pending"
) => {
  const response = await API.get("/pending", {
    params: { page, limit, status },
  });
  return response.data;
};

export const approveUniversityRequest = async (requestId, responseMessage = "") => {
  const response = await API.post(`/approve/${requestId}`, { responseMessage });
  return response.data;
};

export const rejectUniversityRequest = async (requestId, responseMessage = "") => {
  const response = await API.post(`/reject/${requestId}`, { responseMessage });
  return response.data;
};


