const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { listPosts, createPost } = require("../controllers/postController");

const router = express.Router();

router.get("/", listPosts);
router.post("/", protect, authorizeRoles("admin"), createPost);

module.exports = router;
