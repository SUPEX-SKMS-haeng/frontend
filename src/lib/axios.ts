import axios, { type AxiosError } from "axios";
import qs from "qs";
import { toCamelCase, toSnakeCase, transformKeys } from "@/utils/utils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: "brackets" }),
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data) {
    config.data = transformKeys(config.data, toSnakeCase);
  }
  if (config.params) {
    config.params = transformKeys(config.params, toSnakeCase);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = transformKeys(response.data, toCamelCase);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.resolve();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
