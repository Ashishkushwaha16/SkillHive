const API_ORIGIN = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  auth: `${API_ORIGIN}/api/auth`,
  users: `${API_ORIGIN}/api/users`,
  messages: `${API_ORIGIN}/api/messages`,
  chat: `${API_ORIGIN}/api/chat`,
};

export const SOCKET_ORIGIN = API_ORIGIN;
