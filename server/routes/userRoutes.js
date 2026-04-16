const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  updateUserSkills,
  getUsers,
  getSkillMatches,
  getPlatformOverview,
  sendConnectRequest,
  acceptConnectRequest,
  rejectConnectRequest,
  getLeaderboard,
  rateUser,
  getUserReviews,
} = require("../controllers/userController");

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.get("/matches", protect, getSkillMatches);
router.get("/profile", protect, getProfile);
router.get("/platform", protect, getPlatformOverview);
router.put("/profile", protect, updateProfile);
router.put("/skills", protect, updateUserSkills);
router.post("/rate/:ratedUserId", protect, rateUser);
router.get("/reviews/:userId", getUserReviews);
router.get("/", protect, getUsers);
router.post("/connect/:id", protect, sendConnectRequest);
router.post("/accept/:id", protect, acceptConnectRequest);
router.post("/reject/:id", protect, rejectConnectRequest);

module.exports = router;
