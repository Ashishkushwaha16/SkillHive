import { API_ENDPOINTS } from "../config/api";

const API_BASE_URL = API_ENDPOINTS.auth;

export const loginUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};

export const registerUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to start password reset");
  }

  return result;
};

export const resetPassword = async ({ token, password }) => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reset password");
  }

  return result;
};

export const googleAuth = async (credential) => {
  const response = await fetch(`${API_BASE_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Google authentication failed");
  }

  return result;
};
