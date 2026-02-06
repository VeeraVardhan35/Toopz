import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/groups",
  withCredentials: true,
});

export const createGroup = async (data) => {
  try {
    const response = await API.post("/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllGroups = async (type = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    if (type) params.type = type;
    
    const response = await API.get("/", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyGroups = async (page = 1, limit = 10) => {
  try {
    const response = await API.get("/my-groups", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await API.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGroup = async (id, data) => {
  try {
    const response = await API.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await API.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupMembers = async (id, page = 1, limit = 20) => {
  try {
    const response = await API.get(`/${id}/members`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addMember = async (id, data) => {
  try {
    const response = await API.post(`/${id}/members`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeMember = async (groupId, userId) => {
  try {
    const response = await API.delete(`/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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