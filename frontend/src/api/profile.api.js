import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/users",
  withCredentials: true,
});

export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/${userId}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await API.put("/profile", profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await API.post("/upload-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPosts = async (userId, limit = 20) => {
  try {
    const response = await API.get(`/${userId}/posts`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserGroups = async (userId) => {
  try {
    const response = await API.get(`/${userId}/groups`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
