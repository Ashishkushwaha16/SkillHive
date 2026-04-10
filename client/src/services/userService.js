import { API_ENDPOINTS } from "../config/api";

const API_BASE_URL = API_ENDPOINTS.users;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch profile");
  }

  return result;
};

export const updateProfile = async (data) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update profile");
  }

  return result;
};

export const updateUserSkills = async (skills) => {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ skills }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update skills");
  }

  return result;
};

export const getUsers = async (skill = "", options = {}) => {
  const params = new URLSearchParams();

  if (typeof skill === "string" && skill.trim()) {
    params.set(options.multi ? "skills" : "skill", skill.trim());
  }

  if (typeof options.mode === "string" && options.mode) {
    params.set("mode", options.mode);
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch users");
  }

  return result;
};

export const getPlatformOverview = async () => {
  const response = await fetch(`${API_BASE_URL}/platform`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load platform details");
  }

  return result;
};

export const sendConnectRequest = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/connect/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send request");
  }

  return result;
};

export const acceptConnectRequest = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/accept/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to accept request");
  }

  return result;
};

export const rejectConnectRequest = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/reject/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to reject request");
  }

  return result;
};

export const sendMessage = async (messageData) => {
  const response = await fetch(API_ENDPOINTS.messages, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to send message");
  }

  return result;
};

export const getMessages = async () => {
  const response = await fetch(API_ENDPOINTS.messages, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to load messages");
  }

  return result;
};

export const getLeaderboard = async () => {
  const response = await fetch(`${API_BASE_URL}/leaderboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch leaderboard");
  }

  return result;
};

export const rateUser = async (userId, rating) => {
  const response = await fetch(`${API_BASE_URL}/rate/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rating }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit rating");
  }

  return result;
};

export const getUserReviews = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load reviews");
  }

  return result;
};
