const API_ORIGIN =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

export const API_ENDPOINTS = {
  auth: `${API_ORIGIN}/api/auth`,
  users: `${API_ORIGIN}/api/users`,
  messages: `${API_ORIGIN}/api/messages`,
  chat: `${API_ORIGIN}/api/chat`,
  notifications: `${API_ORIGIN}/api/notifications`,
  calls: `${API_ORIGIN}/api/calls`,
  posts: `${API_ORIGIN}/api/posts`,
  feedback: `${API_ORIGIN}/api/feedback`,
  aiSearchConfig: `${API_ORIGIN}/api/ai-search-config`,
};

export const SOCKET_ORIGIN = API_ORIGIN;
