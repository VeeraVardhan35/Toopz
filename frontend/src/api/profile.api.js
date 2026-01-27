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
export const updateUserProfile = async (userId, profileData) => {
  try {
    const formData = new FormData();
    
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.bio) formData.append("bio", profileData.bio);
    if (profileData.title) formData.append("title", profileData.title);
    if (profileData.profileImage) formData.append("profileImage", profileData.profileImage);
    if (profileData.coverImage) formData.append("coverImage", profileData.coverImage);

    const response = await API.put(`/${userId}/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

// Follow/Unfollow user
export const toggleFollow = async (userId) => {
  try {
    const response = await API.post(`/${userId}/follow`);
    return response.data;
  } catch (error) {
    console.error("Toggle follow error:", error);
    throw error;
  }
};

// Get followers
export const getFollowers = async (userId) => {
  try {
    const response = await API.get(`/${userId}/followers`);
    return response.data;
  } catch (error) {
    console.error("Get followers error:", error);
    throw error;
  }
};

// Get following
export const getFollowing = async (userId) => {
  try {
    const response = await API.get(`/${userId}/following`);
    return response.data;
  } catch (error) {
    console.error("Get following error:", error);
    throw error;
  }
};

// Check if current user follows a user
export const checkFollowStatus = async (userId) => {
  try {
    const response = await API.get(`/${userId}/follow-status`);
    return response.data;
  } catch (error) {
    console.error("Check follow status error:", error);
    throw error;
  }
};