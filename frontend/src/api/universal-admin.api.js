import { axiosInstance } from "./axios.api";

<<<<<<< HEAD
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
=======
export const getDashboardStats = () =>
  axiosInstance.get("/admin/stats").then((res) => res.data);

export const getAllUniversities = (page = 1, limit = 20, search = "") =>
  axiosInstance
    .get("/admin/universities", { params: { page, limit, search } })
    .then((res) => res.data);

export const getUniversityById = (id) =>
  axiosInstance.get(`/admin/universities/${id}`).then((res) => res.data);

export const createUniversity = (data) =>
  axiosInstance.post("/admin/universities", data).then((res) => res.data);

export const updateUniversity = (id, data) =>
  axiosInstance.put(`/admin/universities/${id}`, data).then((res) => res.data);

export const deleteUniversity = (id) =>
  axiosInstance.delete(`/admin/universities/${id}`).then((res) => res.data);

export const getUniversityUsers = (
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
  id,
  page = 1,
  limit = 50,
  role = "",
  search = ""
<<<<<<< HEAD
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
=======
) =>
  axiosInstance
    .get(`/admin/universities/${id}/users`, {
      params: { page, limit, role, search },
    })
    .then((res) => res.data);

export const getUniversityPosts = (id, page = 1, limit = 20) =>
  axiosInstance
    .get(`/admin/universities/${id}/posts`, { params: { page, limit } })
    .then((res) => res.data);

export const getUniversityGroups = (id, page = 1, limit = 20, type = "") =>
  axiosInstance
    .get(`/admin/universities/${id}/groups`, {
      params: { page, limit, type },
    })
    .then((res) => res.data);

export const getUserDetails = (userId) =>
  axiosInstance.get(`/admin/users/${userId}`).then((res) => res.data);

export const deleteUser = (userId) =>
  axiosInstance.delete(`/admin/users/${userId}`).then((res) => res.data);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
