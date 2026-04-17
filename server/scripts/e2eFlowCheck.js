require("dotenv").config();

const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
const authBase = `${baseUrl}/api/auth`;
const usersBase = `${baseUrl}/api/users`;
const chatBase = `${baseUrl}/api/chat`;
const notificationsBase = `${baseUrl}/api/notifications`;

const request = async (path, options = {}) => {
  const response = await fetch(path, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(body.message || `Request failed: ${response.status}`);
  }

  return body;
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const run = async () => {
  const suffix = Date.now();
  const testPassword = `SkillHive-Test-${suffix}!`;
  const userA = {
    name: "E2E One",
    email: `e2e.one.${suffix}@skillhive.test`,
    password: testPassword,
  };
  const userB = {
    name: "E2E Two",
    email: `e2e.two.${suffix}@skillhive.test`,
    password: testPassword,
  };

  await request(`${authBase}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userA),
  });
  await request(`${authBase}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userB),
  });

  const loginA = await request(`${authBase}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userA.email, password: userA.password }),
  });
  const loginB = await request(`${authBase}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userB.email, password: userB.password }),
  });

  const tokenA = loginA.token;
  const tokenB = loginB.token;
  const userAId = loginA.user._id;
  const userBId = loginB.user._id;

  await request(`${usersBase}/connect/${userBId}`, {
    method: "POST",
    headers: authHeaders(tokenA),
  });

  const profileB = await request(`${usersBase}/profile`, {
    method: "GET",
    headers: authHeaders(tokenB),
  });

  const hasRequest = (profileB.requestsReceived || []).some((item) => item._id === userAId);
  if (!hasRequest) {
    throw new Error("Connection request not visible in receiver profile");
  }

  await request(`${usersBase}/accept/${userAId}`, {
    method: "POST",
    headers: authHeaders(tokenB),
  });

  await request(`${chatBase}/direct/${userBId}`, {
    method: "POST",
    headers: authHeaders(tokenA),
    body: JSON.stringify({ text: "Hello from automated E2E check" }),
  });

  const notificationsA = await request(`${notificationsBase}?limit=20`, {
    method: "GET",
    headers: authHeaders(tokenA),
  });
  const notificationsB = await request(`${notificationsBase}?limit=20`, {
    method: "GET",
    headers: authHeaders(tokenB),
  });

  const hasAccepted = (notificationsA.notifications || []).some(
    (item) => item.type === "request_accepted"
  );
  if (!hasAccepted) {
    throw new Error("Requester missing request_accepted notification");
  }

  const hasConnectionRequest = (notificationsB.notifications || []).some(
    (item) => item.type === "connection_request"
  );
  const hasNewMessage = (notificationsB.notifications || []).some(
    (item) => item.type === "new_message"
  );

  if (!hasConnectionRequest || !hasNewMessage) {
    throw new Error("Receiver missing expected notifications");
  }

  await request(`${usersBase}/settings/privacy`, {
    method: "PUT",
    headers: authHeaders(tokenA),
    body: JSON.stringify({ showOnlineStatus: false }),
  });

  const hiddenLastSeen = await request(`${chatBase}/lastSeen/${userAId}`, {
    method: "GET",
    headers: authHeaders(tokenB),
  });

  if (!hiddenLastSeen.isHidden) {
    throw new Error("Privacy toggle check failed: last seen should be hidden");
  }

  console.log("E2E flow passed: connect, accept, chat, notifications, privacy.");
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("E2E flow failed:", error.message);
    process.exit(1);
  });
