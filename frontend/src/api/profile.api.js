import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5500/api/v1/users",
  withCredentials: true,
});

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await API.get(`/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await API.put("/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
};

// Get user posts
export const getUserPosts = async (userId, limit = 20) => {
  try {
    const response = await API.get(`/${userId}/posts`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Get user posts error:", error);
    throw error;
  }
};

// Get user groups
export const getUserGroups = async (userId) => {
  try {
    const response = await API.get(`/${userId}/groups`);
    return response.data;
  } catch (error) {
    console.error("Get user groups error:", error);
    throw error;
  }
};
