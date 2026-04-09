import axios from "axios";
class Api {
  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "/",
      withCredentials: true,
    });

    this.axios.interceptors.request.use((config) => {
      const match = document.cookie.match(
        new RegExp("(^| )accessToken=([^;]+)"),
      );
      if (match && match[2]) {
        config.headers.Authorization = `Bearer ${match[2]}`;
      }
      return config;
    });

    this.axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        if (
          error?.response?.status == 401 &&
          error?.response?.data?.message == "Token expired" &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            await this.axios.post("/user-session/get-access-token");
            return this.axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        } else if (
          error?.response?.status == 403 &&
          error?.response?.data?.message == "Refresh token expired"
        ) {
          console.log("Refresh token expired log out the user");
        }
        return Promise.reject(error);
      },
    );
  }

  async get(url, config = {}) {
    try {
      const response = await this.axios.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async post(url, data, config = {}) {
    try {
      const response = await this.axios.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async put(url, data, config = {}) {
    try {
      const response = await this.axios.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async delete(url, config = {}) {
    try {
      const response = await this.axios.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    return (
      error?.response?.data || {
        message:
          "There was an unexpected error at our end. Please try again later.",
      }
    );
  }
}

export const api = new Api();
