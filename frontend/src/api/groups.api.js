import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/groups",
  withCredentials: true,
});

// Create group
export const createGroup = async (data) => {
  try {
    const response = await API.post("/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all groups
export const getAllGroups = async (type = null) => {
  try {
    const response = await API.get("/", {
      params: type ? { type } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get my groups
export const getMyGroups = async () => {
  try {
    const response = await API.get("/my-groups");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get group by ID
export const getGroupById = async (id) => {
  try {
    const response = await API.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update group
export const updateGroup = async (id, data) => {
  try {
    const response = await API.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete group
export const deleteGroup = async (id) => {
  try {
    const response = await API.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get group members
export const getGroupMembers = async (id) => {
  try {
    const response = await API.get(`/${id}/members`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add member
export const addMember = async (id, data) => {
  try {
    const response = await API.post(`/${id}/members`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove member
export const removeMember = async (groupId, userId) => {
  try {
    const response = await API.delete(`/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update member role
export const updateMemberRole = async (groupId, userId, role) => {
  try {
    const response = await API.put(`/${groupId}/members/${userId}/role`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Leave group
export const leaveGroup = async (id) => {
  try {
    const response = await API.post(`/${id}/leave`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const joinGroup = async (id) => {
  try {
    const response = await API.post(`/${id}/join`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all users (for adding members)
export const getAllUsers = async () => {
  try {
    const response = await axios.get("http://localhost:5500/api/v1/users", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};