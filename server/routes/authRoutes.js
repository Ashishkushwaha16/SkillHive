const express = require("express");
const {
  registerUser,
  loginUser,
	forgotPassword,
	resetPassword,
	googleAuth,
  setupInitialAdmin,
} = require("../controllers/authController");
const { validateRequest } = require("../middleware/validateRequest");
const { authLimiter } = require("../middleware/rateLimiter");
const {
	registerValidation,
	loginValidation,
	forgotPasswordValidation,
	resetPasswordValidation,
	googleAuthValidation,
	setupAdminValidation,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", authLimiter, registerValidation, validateRequest, registerUser);
router.post("/login", authLimiter, loginValidation, validateRequest, loginUser);
router.post("/forgot-password", authLimiter, forgotPasswordValidation, validateRequest, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidation, validateRequest, resetPassword);
router.post("/google", authLimiter, googleAuthValidation, validateRequest, googleAuth);
router.post("/setup-admin", authLimiter, setupAdminValidation, validateRequest, setupInitialAdmin);

module.exports = router;
