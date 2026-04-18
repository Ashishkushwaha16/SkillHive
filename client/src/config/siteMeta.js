const formatLegalDate = (rawValue) => {
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || "support@skillhive.app";
export const LEGAL_VERSION = process.env.REACT_APP_LEGAL_VERSION || "v1.0.0";
export const LEGAL_LAST_UPDATED = formatLegalDate(
  process.env.REACT_APP_LEGAL_LAST_UPDATED || new Date().toISOString()
);