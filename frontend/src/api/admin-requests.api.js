import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const submitAdminRequest = async (universityId, requestMessage = "") => {
    const response = await API.post("/admin-requests/submit", { universityId, requestMessage });
    return response.data;
};

export const getMyRequests = async (page = 1, limit = 20) => {
    const response = await API.get("/admin-requests/my-requests", {
        params: { page, limit },
    });
    return response.data;
};

export const getRequestById = async (requestId) => {
    const response = await API.get(`/admin-requests/requests/${requestId}`);
    return response.data;
};

export const getAllPendingRequests = async (page = 1, limit = 20, status = "pending") => {
    const response = await API.get("/admin-requests/pending", {
        params: { page, limit, status },
    });
    return response.data;
};

export const getPendingRequestsCount = async () => {
    const response = await API.get("/admin-requests/count");
    return response.data;
};

export const approveAdminRequest = async (requestId, responseMessage = "") => {
    const response = await API.post(`/admin-requests/approve/${requestId}`, { responseMessage });
    return response.data;
};

export const rejectAdminRequest = async (requestId, responseMessage = "") => {
    const response = await API.post(`/admin-requests/reject/${requestId}`, { responseMessage });
    return response.data;
};

export default API;
