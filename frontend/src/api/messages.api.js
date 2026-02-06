import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const getConversations = async (page = 1, limit = 20) => {
  try {
    const response = await API.get("/messages/conversations", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrCreateConversation = async (otherUserId) => {
  try {
    const response = await API.post("/messages/conversations/direct", { otherUserId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createGroupConversation = async (groupId) => {
  try {
    const response = await API.post("/messages/conversations/group", { groupId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await API.get(`/messages/conversations/${conversationId}/messages`, {
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
      `/messages/conversations/${conversationId}/messages`,
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
    const response = await API.put(`/messages/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editMessage = async (messageId, content) => {
  try {
    const response = await API.put(`/messages/messages/${messageId}`, { content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await API.delete(`/messages/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchConversations = async (query, page = 1, limit = 50) => {
  try {
    const response = await API.get("/messages/conversations/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query, page = 1, limit = 20) => {
  try {
    const response = await API.get("/messages/conversations/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
