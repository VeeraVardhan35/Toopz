import { axiosInstance } from "./axios.api";

<<<<<<< HEAD
const API = axiosInstance;

export const submitUniversityRequest = async (payload) => {
  const response = await API.post("/university-requests/submit", payload);
  return response.data;
};

export const uploadUniversityLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  const response = await API.post("/university-requests/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMyUniversityRequests = async (page = 1, limit = 20) => {
  const response = await API.get("/university-requests/my-requests", {
    params: { page, limit },
  });
  return response.data;
};

export const getAllUniversityRequests = async (
  page = 1,
  limit = 20,
  status = "pending"
) => {
  const response = await API.get("/university-requests/pending", {
    params: { page, limit, status },
  });
  return response.data;
};

export const approveUniversityRequest = async (requestId, responseMessage = "") => {
  const response = await API.post(`/university-requests/approve/${requestId}`, { responseMessage });
  return response.data;
};

export const rejectUniversityRequest = async (requestId, responseMessage = "") => {
  const response = await API.post(`/university-requests/reject/${requestId}`, { responseMessage });
  return response.data;
};

=======
export const submitUniversityRequest = (payload) =>
  axiosInstance
    .post("/university-requests/submit", payload)
    .then((res) => res.data);

export const uploadUniversityLogo = (file) => {
  const formData = new FormData();
  formData.append("logo", file);

  return axiosInstance
    .post("/university-requests/upload-logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getMyUniversityRequests = (page = 1, limit = 20) =>
  axiosInstance
    .get("/university-requests/my-requests", {
      params: { page, limit },
    })
    .then((res) => res.data);

export const getAllUniversityRequests = (
  page = 1,
  limit = 20,
  status = "pending"
) =>
  axiosInstance
    .get("/university-requests/pending", {
      params: { page, limit, status },
    })
    .then((res) => res.data);

export const approveUniversityRequest = (requestId, responseMessage = "") =>
  axiosInstance
    .post(`/university-requests/approve/${requestId}`, { responseMessage })
    .then((res) => res.data);

export const rejectUniversityRequest = (requestId, responseMessage = "") =>
  axiosInstance
    .post(`/university-requests/reject/${requestId}`, { responseMessage })
    .then((res) => res.data);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
