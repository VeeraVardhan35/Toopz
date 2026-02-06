import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5500/api/v1",
    withCredentials: true
});

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

export const getPostById = async (postId) => {
    try {
        const response = await API.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

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

export const deletePost = async (postId) => {
    try {
        const response = await API.delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const likePost = async (postId) => {
    try {
        const response = await API.post(`/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const unlikePost = async (postId) => {
    try {
        const response = await API.delete(`/posts/${postId}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPostLikes = async (postId, page = 1, limit = 20) => {
    try {
        const response = await API.get(`/posts/${postId}/like`, {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const commentOnPost = async (postId, content) => {
    try {
        const response = await API.post(`/posts/${postId}/comment`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

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

export const deleteComment = async (postId, commentId) => {
    try {
        const response = await API.delete(`/posts/${postId}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
