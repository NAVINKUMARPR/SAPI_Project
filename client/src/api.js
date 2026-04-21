import axios from "axios";

const isBrowser = typeof window !== "undefined";

function getDefaultApiBaseUrl() {
  if (!isBrowser) {
    return "http://localhost:5000/api";
  }

  const { hostname, protocol } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isPrivateNetworkHost =
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  if (isLocalhost || isPrivateNetworkHost) {
    return `${protocol}//${hostname}:5000/api`;
  }

  return "https://sapi-project.onrender.com/api";
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sapi_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
