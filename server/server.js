require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initChatSocket } = require("./socket/chatSocket");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "10kb" }));

if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SkillHive API Running..." });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.use("/api", notFound);
app.use(errorHandler);

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing required env: MONGO_URI");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("Missing required env: JWT_SECRET");
  }

  await connectDB();
  const server = http.createServer(app);
  const io = initChatSocket(server, process.env.CLIENT_ORIGIN || "*");
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${NODE_ENV})`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
