import { API_ENDPOINTS } from "../config/api";

const API_BASE_URL = API_ENDPOINTS.users;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
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

  if (typeof options.minRating !== "undefined" && options.minRating !== "") {
    params.set("minRating", options.minRating);
  }

  if (typeof options.maxRating !== "undefined" && options.maxRating !== "") {
    params.set("maxRating", options.maxRating);
  }

  if (typeof options.sortBy === "string" && options.sortBy) {
    params.set("sortBy", options.sortBy);
  }

  if (typeof options.sortOrder === "string" && options.sortOrder) {
    params.set("sortOrder", options.sortOrder);
  }

  if (typeof options.page !== "undefined" && options.page !== "") {
    params.set("page", options.page);
  }

  if (typeof options.limit !== "undefined" && options.limit !== "") {
    params.set("limit", options.limit);
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

export const getSkillMatches = async (options = {}) => {
  const params = new URLSearchParams();

  if (typeof options.skills === "string" && options.skills.trim()) {
    params.set("skills", options.skills.trim());
  }

  if (typeof options.minScore !== "undefined" && options.minScore !== "") {
    params.set("minScore", options.minScore);
  }

  if (typeof options.minRating !== "undefined" && options.minRating !== "") {
    params.set("minRating", options.minRating);
  }

  if (typeof options.sortBy === "string" && options.sortBy) {
    params.set("sortBy", options.sortBy);
  }

  if (typeof options.sortOrder === "string" && options.sortOrder) {
    params.set("sortOrder", options.sortOrder);
  }

  if (typeof options.limit !== "undefined" && options.limit !== "") {
    params.set("limit", options.limit);
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/matches?${queryString}` : `${API_BASE_URL}/matches`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch skill matches");
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
    throw new Error(result.message || result.error || "Failed to send message");
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
    throw new Error(result.message || result.error || "Failed to load messages");
  }

  return result;
};

export const getDirectMessages = async (userId, options = {}) => {
  const params = new URLSearchParams();

  if (typeof options.page !== "undefined" && options.page !== "") {
    params.set("page", options.page);
  }

  if (typeof options.limit !== "undefined" && options.limit !== "") {
    params.set("limit", options.limit);
  }

  const query = params.toString();
  const url = query
    ? `${API_ENDPOINTS.chat}/direct/${userId}?${query}`
    : `${API_ENDPOINTS.chat}/direct/${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load direct messages");
  }

  return result;
};

export const sendDirectMessage = async (userId, text) => {
  const response = await fetch(`${API_ENDPOINTS.chat}/direct/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send direct message");
  }

  return result;
};

export const getChatConversations = async () => {
  const response = await fetch(`${API_ENDPOINTS.chat}/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load chat conversations");
  }

  return result;
};

export const getCallHistory = async (limit = 40) => {
  const response = await fetch(`${API_ENDPOINTS.calls}/history?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load call history");
  }

  return result;
};

export const markDirectMessagesRead = async (userId) => {
  const response = await fetch(`${API_ENDPOINTS.chat}/direct/${userId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to mark messages as read");
  }

  return result;
};

export const getLastSeen = async (userId) => {
  const response = await fetch(`${API_ENDPOINTS.chat}/lastSeen/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch last seen");
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

export const rateUser = async (userId, rating, comment = "") => {
  const response = await fetch(`${API_BASE_URL}/rate/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rating, comment }),
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

export const uploadProfileAssets = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/profile/assets`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to upload profile files");
  }

  return result;
};

export const deleteProfileAvatar = async () => {
  const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to remove avatar");
  }

  return result;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await fetch(`${API_BASE_URL}/settings/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to change password");
  }

  return result;
};

export const changeEmail = async ({ newEmail, password }) => {
  const response = await fetch(`${API_BASE_URL}/settings/email`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ newEmail, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to change email");
  }

  return result;
};

export const updatePrivacySettings = async ({ showOnlineStatus }) => {
  const response = await fetch(`${API_BASE_URL}/settings/privacy`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ showOnlineStatus }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update privacy settings");
  }

  return result;
};

export const getNotifications = async (limit = 20) => {
  const response = await fetch(`${API_ENDPOINTS.notifications}?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load notifications");
  }

  return result;
};

export const markNotificationRead = async (notificationId) => {
  const response = await fetch(`${API_ENDPOINTS.notifications}/${notificationId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to mark notification read");
  }

  return result;
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_ENDPOINTS.notifications}/read-all`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to mark all notifications read");
  }

  return result;
};

export const getHomePosts = async () => {
  const response = await fetch(API_ENDPOINTS.posts, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load posts");
  }

  return result;
};

export const createHomePost = async ({ title, description }) => {
  const response = await fetch(API_ENDPOINTS.posts, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create post");
  }

  return result;
};

export const submitFeedback = async ({ category, message }) => {
  const response = await fetch(API_ENDPOINTS.feedback, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ category, message }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit feedback");
  }

  return result;
};
