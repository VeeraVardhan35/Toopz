import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const getUniversities = () => API.get("/meta/universities");
