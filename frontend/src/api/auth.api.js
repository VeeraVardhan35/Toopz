import { axiosInstance } from "./axios.api";

<<<<<<< HEAD
export const loginUser = (data) => axiosInstance.post("/auth/sign-in", data);

export const signUser = (data) => axiosInstance.post("/auth/sign-up", data);

export const logoutUser = () => axiosInstance.post("/auth/sign-out");
=======
const API = axiosInstance;

export const loginUser = (data) => API.post("/auth/sign-in", data);

export const signUser = (data) => API.post("/auth/sign-up", data);

export const logoutUser = () => API.post("/auth/sign-out");
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
