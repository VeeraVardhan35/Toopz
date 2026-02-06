import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const composeEmail = async (formData) => {
  try {
    const response = await API.post("/emails/compose", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllEmails = async (filter = null, page = 1, limit = 20) => {
  try {
    const params = { page, limit };
    if (filter) params.filter = filter;
    
    const response = await API.get("/emails", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEmailsByType = async (type, page = 1, limit = 20) => {
  try {
    const response = await API.get("/emails/type", {
      params: { type, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEmailById = async (id) => {
  try {
    const response = await API.get(`/emails/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await API.get("/emails/unread-count");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await API.put(`/emails/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsUnread = async (id) => {
  try {
    const response = await API.put(`/emails/${id}/unread`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleStar = async (id) => {
  try {
    const response = await API.put(`/emails/${id}/star`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const replyToEmail = async (id, content) => {
  try {
    const response = await API.post(`/emails/${id}/reply`, { content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEmail = async (id) => {
  try {
    const response = await API.delete(`/emails/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchEmails = async (query, page = 1, limit = 20) => {
  try {
    const response = await API.get("/emails/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await API.get("/auth/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupsForEmail = async () => {
  try {
    const response = await API.get("/emails/groups-list");
    return response.data;
  } catch (error) {
    throw error;
  }
};
