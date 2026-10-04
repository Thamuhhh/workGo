import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
const isApiConfigured = configuredBaseUrl.length > 0;

const CONFIG_ERROR =
  'Server address is not configured. Rebuild the app with EXPO_PUBLIC_API_URL set.';

// `.invalid` is reserved by RFC 2606 and never resolves, so an unconfigured build
// fails fast instead of silently talking to some unintended host. There is no
// localhost fallback on purpose: on a physical device localhost is the phone
// itself, which is what made release APKs fail with "Network Error".
const BASE_URL = (configuredBaseUrl || 'https://api-unconfigured.invalid/api/v1').replace(
  /\/+$/,
  ''
);

if (!isApiConfigured) {
  console.warn(`[api] EXPO_PUBLIC_API_URL is not set. All requests will fail with "${CONFIG_ERROR}".`);
}

type ApiErrorBody = { message?: string; errors?: unknown };

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, log user out
      await useAuthStore.getState().logout();
    }

    // The message is patched onto the original AxiosError instead of wrapping it in a
    // plain Error, so callers reading `error.response?.data?.message` keep working.
    if (!isApiConfigured) {
      error.message = CONFIG_ERROR;
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response) {
      error.message =
        error.response.status >= 500
          ? 'The server had a problem. Please try again later.'
          : `Request failed (${error.response.status}).`;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your connection.';
    } else {
      error.message = "Cannot reach the server. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

export default apiClient;
