import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;
export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});
