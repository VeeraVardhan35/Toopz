import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5500/api/v1",
    withCredentials: true
});

// Get all posts with pagination
export const getAllPosts = async (page = 1, limit = 10) => {
    try {
        const response = await API.get("/posts", {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get post by ID
export const getPostById = async (postId) => {
    try {
        const response = await API.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get user posts with pagination
export const getUserPosts = async (userId, page = 1, limit = 10) => {
    try {
        const response = await API.get(`/posts/user/${userId}`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create post
export const createPost = async (formData) => {
    try {
        const response = await API.post("/posts", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update post
export const updatePost = async (postId, formData) => {
    try {
        const response = await API.put(`/posts/${postId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete post
export const deletePost = async (postId) => {
    try {
        const response = await API.delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Like post
export const likePost = async (postId) => {
    try {
        const response = await API.post(`/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unlike post
export const unlikePost = async (postId) => {
    try {
        const response = await API.delete(`/posts/${postId}/unlike`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get post likes with pagination
export const getPostLikes = async (postId, page = 1, limit = 20) => {
    try {
        const response = await API.get(`/posts/${postId}/likes`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Comment on post
export const commentOnPost = async (postId, content) => {
    try {
        const response = await API.post(`/posts/${postId}/comment`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get post comments with pagination
export const getPostComments = async (postId, page = 1, limit = 20) => {
    try {
        const response = await API.get(`/posts/${postId}/comments`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
    try {
        const response = await API.delete(`/posts/${postId}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};