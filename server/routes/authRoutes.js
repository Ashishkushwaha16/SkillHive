const express = require("express");
const {
  registerUser,
  loginUser,
  setupInitialAdmin,
} = require("../controllers/authController");
const { validateRequest } = require("../middleware/validateRequest");
const { authLimiter } = require("../middleware/rateLimiter");
const {
	registerValidation,
	loginValidation,
	setupAdminValidation,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", authLimiter, registerValidation, validateRequest, registerUser);
router.post("/login", authLimiter, loginValidation, validateRequest, loginUser);
router.post("/setup-admin", authLimiter, setupAdminValidation, validateRequest, setupInitialAdmin);

module.exports = router;
