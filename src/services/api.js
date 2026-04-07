import axios from "axios";

class Api {
  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "/",
      withCredentials: true,
    });
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
        message: "Unexpected error. Try again later.",
      }
    );
  }
}

export const api = new Api();
