import axios from "axios";
import router from "./router";
import { useAuthStore } from "./stores/auth";

const baseURL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  // headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const accessToken = authStore.accessToken;

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if ([401, 403].includes(error.status) && !originalRequest._retry) {
      originalRequest._retry = true;

      const authStore = useAuthStore();
      try {
        const refreshToken = authStore.refreshToken;
        const {
          data: { accessToken },
        } = await axios.post(`${baseURL}/refreshToken`, {
          refreshToken,
        });

        const newAccessToken = accessToken;
        authStore.setAccessToken(newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        const { data } = await axios(originalRequest);
        return data;
      } catch (err) {
        console.error("Error refreshing token", err);
        authStore.unsetTokens();
        router.push("login");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
