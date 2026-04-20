const AUTH_FAILURE_MESSAGES = [
  "not authorized",
  "session expired",
  "invalid token",
];

const shouldHandleUnauthorized = (responseStatus, message) => {
  if (responseStatus !== 401) {
    return false;
  }

  const normalized = String(message || "").toLowerCase();
  return AUTH_FAILURE_MESSAGES.some((item) => normalized.includes(item));
};

const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authChange"));
};

export const requestJson = async (
  url,
  options = {},
  { handleUnauthorized = false } = {}
) => {
  const response = await fetch(url, options);

  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (!response.ok) {
    const message = result.message || result.error || `Request failed (${response.status})`;

    if (handleUnauthorized && shouldHandleUnauthorized(response.status, message)) {
      clearAuthSession();
    }

    throw new Error(message);
  }

  return result;
};
