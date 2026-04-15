const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

const setupAdminValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

module.exports = {
  registerValidation,
  loginValidation,
  setupAdminValidation,
};
