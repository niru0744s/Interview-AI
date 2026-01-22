import axios,{AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse} from "axios";

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.BASE_URL as string,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");

        if(token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) =>{
        const status = error.response?.status;

        if(status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        return Promise.reject({
            status,
            message:
            (error.response?.data as {message?: string})?.message || 
            error.message || 
            "Something went wrong",
        });
    }
);

export default api;