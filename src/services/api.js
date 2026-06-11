import axios from "axios";
class Api {
  constructor() {
    this._axios = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "/",
      withCredentials: true,
    });

    this._axios.interceptors.response.use(
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
            await this._axios.post("/session/renew");
            return this._axios(originalRequest);
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
      const response = await this._axios.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async post(url, data, config = {}) {
    try {
      const response = await this._axios.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async put(url, data, config = {}) {
    try {
      const response = await this._axios.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
  async delete(url, config = {}) {
    try {
      const response = await this._axios.delete(url, config);
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
