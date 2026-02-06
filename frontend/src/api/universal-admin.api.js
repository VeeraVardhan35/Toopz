import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/admin",
  withCredentials: true,
});

export const getDashboardStats = async () => {
  const response = await API.get("/stats");
  return response.data;
};

export const getAllUniversities = async (page = 1, limit = 20, search = "") => {
  const response = await API.get("/universities", {
    params: { page, limit, search },
  });
  return response.data;
};

export const getUniversityById = async (id) => {
  const response = await API.get(`/universities/${id}`);
  return response.data;
};

export const createUniversity = async (data) => {
  const response = await API.post("/universities", data);
  return response.data;
};

export const updateUniversity = async (id, data) => {
  const response = await API.put(`/universities/${id}`, data);
  return response.data;
};

export const deleteUniversity = async (id) => {
  const response = await API.delete(`/universities/${id}`);
  return response.data;
};

export const getUniversityUsers = async (
  id,
  page = 1,
  limit = 50,
  role = "",
  search = ""
) => {
  const response = await API.get(`/universities/${id}/users`, {
    params: { page, limit, role, search },
  });
  return response.data;
};

export const getUniversityPosts = async (id, page = 1, limit = 20) => {
  const response = await API.get(`/universities/${id}/posts`, {
    params: { page, limit },
  });
  return response.data;
};

export const getUniversityGroups = async (id, page = 1, limit = 20, type = "") => {
  const response = await API.get(`/universities/${id}/groups`, {
    params: { page, limit, type },
  });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await API.get(`/users/${userId}`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/users/${userId}`);
  return response.data;
};

export default API;