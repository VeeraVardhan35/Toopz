// posts.api.js
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5500/api/v1",
    withCredentials: true
});

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