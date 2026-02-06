import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const createGroup = async (data) => {
  try {
    const response = await API.post("/groups", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllGroups = async (type = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    if (type) params.type = type;
    
    const response = await API.get("/groups", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyGroups = async (page = 1, limit = 10) => {
  try {
    const response = await API.get("/groups/my-groups", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await API.get(`/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGroup = async (id, data) => {
  try {
    const response = await API.put(`/groups/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await API.delete(`/groups/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupMembers = async (id, page = 1, limit = 20) => {
  try {
    const response = await API.get(`/groups/${id}/members`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addMember = async (id, data) => {
  try {
    const response = await API.post(`/groups/${id}/members`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeMember = async (groupId, userId) => {
  try {
    const response = await API.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMemberRole = async (groupId, userId, role) => {
  try {
    const response = await API.put(`/groups/${groupId}/members/${userId}/role`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const leaveGroup = async (id) => {
  try {
    const response = await API.post(`/groups/${id}/leave`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const joinGroup = async (id) => {
  try {
    const response = await API.post(`/groups/${id}/join`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};
