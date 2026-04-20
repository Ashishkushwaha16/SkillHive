import { API_ENDPOINTS } from "../config/api";
import { requestJson } from "./apiClient";

const API_BASE_URL = API_ENDPOINTS.auth;

export const loginUser = async (data) => {
  return requestJson(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const registerUser = async (data) => {
  return requestJson(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const forgotPassword = async (email) => {
  return requestJson(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async ({ token, password }) => {
  return requestJson(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });
};

export const googleAuth = async (credential) => {
  return requestJson(`${API_BASE_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });
};
