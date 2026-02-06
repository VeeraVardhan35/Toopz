import { axiosInstance } from "./axios.api";

export const loginUser = (data) => axiosInstance.post("/auth/sign-in", data);

export const signUser = (data) => axiosInstance.post("/auth/sign-up", data);

export const logoutUser = () => axiosInstance.post("/auth/sign-out");
