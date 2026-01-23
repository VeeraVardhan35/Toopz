import axios from "axios";

const API = axios.create({
    baseURL:"http://localhost:5500/api/v1/auth",
    withCredentials:true
});

export const loginUser = (data) => API.post("/sign-in", data);
export const signUser = (data) => API.post("/sign-up", data);