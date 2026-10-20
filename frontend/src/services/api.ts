import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface SessionResponse {
  user: User;
  accessToken: string;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<SessionResponse> | null = null;

export function refreshSession(): Promise<SessionResponse> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<SessionResponse>("/auth/refresh")
      .then((res) => {
        accessToken = res.data.accessToken;
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isAuthPath(url: string | undefined) {
  return (
    url !== undefined &&
    (url.includes("/auth/refresh") || url.includes("/auth/login"))
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthPath(original.url)
    ) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        setAccessToken(null);
        useAuthStore.getState().setUser(null);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
