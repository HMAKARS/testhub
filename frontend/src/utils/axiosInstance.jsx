// src/utils/axiosInstance.js
import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8000/",
});

// axiosInstance.js
instance.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            // refresh API 호출
            const res = await axios.post("/api/token/refresh/", {
                refresh: localStorage.getItem("refresh_token"),
            });
            localStorage.setItem("token", res.data.access);
            error.config.headers["Authorization"] = `Bearer ${res.data.access}`;
            return axios(error.config);  // 재요청
        }
        return Promise.reject(error);
    }
);

export default instance;
