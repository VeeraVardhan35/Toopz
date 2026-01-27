import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/emails",
  withCredentials: true,
});

// Compose email
export const composeEmail = async (formData) => {
  try {
    const response = await API.post("/compose", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all emails with pagination
export const getAllEmails = async (filter = null, page = 1, limit = 20) => {
  try {
    const params = { page, limit };
    if (filter) params.filter = filter;
    
    const response = await API.get("/", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get emails by type with pagination
export const getEmailsByType = async (type, page = 1, limit = 20) => {
  try {
    const response = await API.get(`/type/${type}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get email by ID
export const getEmailById = async (id) => {
  try {
    const response = await API.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await API.get("/unread-count");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark as read
export const markAsRead = async (id) => {
  try {
    const response = await API.put(`/${id}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark as unread
export const markAsUnread = async (id) => {
  try {
    const response = await API.put(`/${id}/unread`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle star
export const toggleStar = async (id) => {
  try {
    const response = await API.put(`/${id}/star`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reply to email
export const replyToEmail = async (id, content) => {
  try {
    const response = await API.post(`/${id}/reply`, { content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete email
export const deleteEmail = async (id) => {
  try {
    const response = await API.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search emails with pagination
export const searchEmails = async (query, page = 1, limit = 20) => {
  try {
    const response = await API.get("/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all users (for compose)
export const getAllUsers = async () => {
  try {
    const response = await axios.get("http://localhost:5500/api/v1/auth/users", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get groups for email compose
export const getGroupsForEmail = async () => {
  try {
    const response = await API.get("/groups-list");
    return response.data;
  } catch (error) {
    throw error;
  }
};