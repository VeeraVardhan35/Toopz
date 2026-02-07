import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const getDashboardStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data;
};

export const getAllUniversities = async (page = 1, limit = 20, search = "") => {
  const response = await API.get("/admin/universities", {
    params: { page, limit, search },
  });
  return response.data;
};

export const getUniversityById = async (id) => {
  const response = await API.get(`/admin/universities/${id}`);
  return response.data;
};

export const createUniversity = async (data) => {
  const response = await API.post("/admin/universities", data);
  return response.data;
};

export const updateUniversity = async (id, data) => {
  const response = await API.put(`/admin/universities/${id}`, data);
  return response.data;
};

export const deleteUniversity = async (id) => {
  const response = await API.delete(`/admin/universities/${id}`);
  return response.data;
};

export const getUniversityUsers = async (
  id,
  page = 1,
  limit = 50,
  role = "",
  search = ""
) => {
  const response = await API.get(`/admin/universities/${id}/users`, {
    params: { page, limit, role, search },
  });
  return response.data;
};

export const getUniversityPosts = async (id, page = 1, limit = 20) => {
  const response = await API.get(`/admin/universities/${id}/posts`, {
    params: { page, limit },
  });
  return response.data;
};

export const getUniversityGroups = async (id, page = 1, limit = 20, type = "") => {
  const response = await API.get(`/admin/universities/${id}/groups`, {
    params: { page, limit, type },
  });
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await API.get(`/admin/users/${userId}`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/admin/users/${userId}`);
  return response.data;
};

export default API;
