import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await API.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await API.post("/users/upload-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPosts = async (userId, limit = 20) => {
  try {
    const response = await API.get(`/users/${userId}/posts`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserGroups = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}/groups`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
