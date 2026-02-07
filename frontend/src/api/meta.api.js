<<<<<<< HEAD
import { axiosInstance } from "./axios.api";

const API = axiosInstance;

export const getUniversities = () => API.get("/meta/universities");
=======
import axios from "axios";

const API = axios.create({
    baseURL:"http://localhost:5500/api/v1/meta",
    withCredentials:true
});

export const getUniversities = () => API.get("/universities");
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
