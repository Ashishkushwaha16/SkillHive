require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("SkillHive API Running...");
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log("Server running"));
};

startServer();
