import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/messages",
  withCredentials: true,
});

export const getConversations = async (page = 1, limit = 20) => {
  try {
    const response = await API.get("/conversations", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrCreateConversation = async (otherUserId) => {
  try {
    const response = await API.post("/conversations/direct", { otherUserId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createGroupConversation = async (groupId) => {
  try {
    const response = await API.post("/conversations/group", { groupId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await API.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (conversationId, data) => {
  try {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("type", data.type || "text");
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await API.post(
      `/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (conversationId) => {
  try {
    const response = await API.put(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editMessage = async (messageId, content) => {
  try {
    const response = await API.put(`/messages/${messageId}`, { content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await API.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchConversations = async (query, page = 1, limit = 50) => {
  try {
    const response = await API.get("/conversations/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query, page = 1, limit = 20) => {
  try {
    const response = await API.get("/conversations/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
