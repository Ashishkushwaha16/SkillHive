import { API_ENDPOINTS } from "../config/api";
import { requestJson } from "./apiClient";

const API_BASE_URL = API_ENDPOINTS.users;
const withAuthHandling = { handleUnauthorized: true };

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
  return requestJson(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const updateProfile = async (data) => {
  return requestJson(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, withAuthHandling);
};

export const updateUserSkills = async (skills) => {
  return requestJson(`${API_BASE_URL}/skills`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ skills }),
  }, withAuthHandling);
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

  return requestJson(url, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
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

  return requestJson(url, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getPlatformOverview = async () => {
  return requestJson(`${API_BASE_URL}/platform`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const sendConnectRequest = async (userId) => {
  return requestJson(`${API_BASE_URL}/connect/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const acceptConnectRequest = async (userId) => {
  return requestJson(`${API_BASE_URL}/accept/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const rejectConnectRequest = async (userId) => {
  return requestJson(`${API_BASE_URL}/reject/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const sendMessage = async (messageData) => {
  return requestJson(API_ENDPOINTS.messages, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  });
};

export const getMessages = async () => {
  return requestJson(API_ENDPOINTS.messages, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
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

  return requestJson(url, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const sendDirectMessage = async (userId, text) => {
  return requestJson(`${API_ENDPOINTS.chat}/direct/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  }, withAuthHandling);
};

export const getChatConversations = async () => {
  return requestJson(`${API_ENDPOINTS.chat}/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getCallHistory = async (limit = 40) => {
  return requestJson(`${API_ENDPOINTS.calls}/history?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const markDirectMessagesRead = async (userId) => {
  return requestJson(`${API_ENDPOINTS.chat}/direct/${userId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getLastSeen = async (userId) => {
  return requestJson(`${API_ENDPOINTS.chat}/lastSeen/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getLeaderboard = async () => {
  return requestJson(`${API_BASE_URL}/leaderboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const rateUser = async (userId, rating, comment = "") => {
  return requestJson(`${API_BASE_URL}/rate/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rating, comment }),
  }, withAuthHandling);
};

export const getUserReviews = async (userId) => {
  return requestJson(`${API_BASE_URL}/reviews/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const uploadProfileAssets = async (formData) => {
  const token = localStorage.getItem("token");
  return requestJson(`${API_BASE_URL}/profile/assets`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  }, withAuthHandling);
};

export const deleteProfileAvatar = async () => {
  return requestJson(`${API_BASE_URL}/profile/avatar`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  return requestJson(`${API_BASE_URL}/settings/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  }, withAuthHandling);
};

export const changeEmail = async ({ newEmail, password }) => {
  return requestJson(`${API_BASE_URL}/settings/email`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ newEmail, password }),
  }, withAuthHandling);
};

export const updatePrivacySettings = async ({ showOnlineStatus }) => {
  return requestJson(`${API_BASE_URL}/settings/privacy`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ showOnlineStatus }),
  }, withAuthHandling);
};

export const getNotifications = async (limit = 20) => {
  return requestJson(`${API_ENDPOINTS.notifications}?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const markNotificationRead = async (notificationId) => {
  return requestJson(`${API_ENDPOINTS.notifications}/${notificationId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const markAllNotificationsRead = async () => {
  return requestJson(`${API_ENDPOINTS.notifications}/read-all`, {
    method: "PUT",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getHomePosts = async () => {
  return requestJson(API_ENDPOINTS.posts, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createHomePost = async ({ title, description }) => {
  return requestJson(API_ENDPOINTS.posts, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description }),
  }, withAuthHandling);
};

export const submitFeedback = async ({ category, message }) => {
  return requestJson(API_ENDPOINTS.feedback, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ category, message }),
  }, withAuthHandling);
};

export const getFeedbackEntries = async () => {
  return requestJson(API_ENDPOINTS.feedback, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const getAiSearchQuickIssues = async () => {
  return requestJson(`${API_ENDPOINTS.aiSearchConfig}/quick-issues`, {
    method: "GET",
    headers: getAuthHeaders(),
  }, withAuthHandling);
};

export const updateAiSearchQuickIssues = async (issues) => {
  return requestJson(`${API_ENDPOINTS.aiSearchConfig}/quick-issues`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ issues }),
  }, withAuthHandling);
};
