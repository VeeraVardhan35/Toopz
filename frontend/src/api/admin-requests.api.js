import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5500/api/v1/admin-requests",
    withCredentials: true,
});

// Submit admin request
export const submitAdminRequest = async (universityId, requestMessage = "") => {
    const response = await API.post("/submit", { universityId, requestMessage });
    return response.data;
};

// Get my requests
export const getMyRequests = async (page = 1, limit = 20) => {
    const response = await API.get("/my-requests", {
        params: { page, limit },
    });
    return response.data;
};

// Get request by ID
export const getRequestById = async (requestId) => {
    const response = await API.get(`/requests/${requestId}`);
    return response.data;
};

// Universal Admin endpoints
export const getAllPendingRequests = async (page = 1, limit = 20, status = "pending") => {
    const response = await API.get("/pending", {
        params: { page, limit, status },
    });
    return response.data;
};

export const getPendingRequestsCount = async () => {
    const response = await API.get("/count");
    return response.data;
};

export const approveAdminRequest = async (requestId, responseMessage = "") => {
    const response = await API.post(`/approve/${requestId}`, { responseMessage });
    return response.data;
};

export const rejectAdminRequest = async (requestId, responseMessage = "") => {
    const response = await API.post(`/reject/${requestId}`, { responseMessage });
    return response.data;
};

export default API;