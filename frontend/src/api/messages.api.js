import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/messages",
  withCredentials: true,
});

// Get all conversations
export const getConversations = async () => {
  try {
    const response = await API.get("/conversations");
    return response.data;
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error;
  }
};

// Get or create direct conversation
export const getOrCreateConversation = async (otherUserId) => {
  try {
    const response = await API.post("/conversations/direct", { otherUserId });
    return response.data;
  } catch (error) {
    console.error("Get or create conversation error:", error);
    throw error;
  }
};

// Create or get group conversation
export const createGroupConversation = async (groupId) => {
  try {
    const response = await API.post("/conversations/group", { groupId });
    return response.data;
  } catch (error) {
    console.error("Create group conversation error:", error);
    throw error;
  }
};

// Get messages in a conversation
export const getMessages = async (conversationId, limit = 50, before = null) => {
  try {
    const response = await API.get(`/conversations/${conversationId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error;
  }
};

// Send message (without Socket.IO)
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
    console.error("Send message error:", error);
    throw error;
  }
};

// Mark messages as read
export const markAsRead = async (conversationId) => {
  try {
    const response = await API.put(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Mark as read error:", error);
    throw error;
  }
};

// Edit message
export const editMessage = async (messageId, content) => {
  try {
    const response = await API.put(`/messages/${messageId}`, { content });
    return response.data;
  } catch (error) {
    console.error("Edit message error:", error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    const response = await API.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error("Delete message error:", error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const response = await API.get("/conversations/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw error;
  }
};

// Search conversations (returns users and groups)
export const searchConversations = async (query) => {
  try {
    const response = await API.get("/conversations/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Search conversations error:", error);
    throw error;
  }
};