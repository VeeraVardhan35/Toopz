import axios from "axios";

const API = axios.create({
    baseURL:"http://localhost:5500/api/v1/meta",
    withCredentials:true
});

export const getUniversities = () => API.get("/universities");
// export const signUser = (data) => API.post("/sign-up", data);