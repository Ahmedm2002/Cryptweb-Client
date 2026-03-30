export class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  request(endpoint, options = {}) {
    const controller = new AbortController();

    const requestPromise = (async () => {
      try {
        const config = {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        };

        const token = sessionStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, config);

        let data;
        try {
          data = await response.json();
        } catch {
          throw {
            statusCode: response.status,
            message: "Invalid JSON response",
            success: false,
          };
        }

        if (!response.ok || data?.success === false) {
          throw {
            statusCode: response.status,
            ...data,
          };
        }

        return data;
      } catch (error) {
        if (error.name === "AbortError") {
          throw {
            isCanceled: true,
            message: "Request canceled",
          };
        }

        throw error;
      }
    })();

    return {
      promise: requestPromise,
      abort: () => controller.abort(),
    };
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      ...options,
    });
  }
}

export const api = new ApiService(
  import.meta.env.VITE_API_BASE_URL || "/api/v1",
);
