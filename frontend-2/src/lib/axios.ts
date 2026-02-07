import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api` as string,
    withCredentials: true,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },

    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        return Promise.reject({
            status,
            message:
                (error.response?.data as { message?: string })?.message ||
                error.message ||
                "Something went wrong",
        });
    }
);

export default api;