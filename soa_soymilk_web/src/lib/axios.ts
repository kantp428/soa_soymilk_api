import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://soasoymilkapi-production.up.railway.app/';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const localApiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {

            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        } catch (refreshError) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
    }

    return Promise.reject(error);
  }
);
