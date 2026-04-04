const router = require("express").Router();
const { body } = require("express-validator");
const controller = require("./auth.controller");
const { validate } = require("../../middleware/validate");
const { protect } = require("../../middleware/auth");
const { authLimiter } = require("../../middleware/rateLimiter");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password min 6 characters"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post(
  "/register",
  authLimiter,
  registerRules,
  validate,
  controller.register,
);
router.post("/login", authLimiter, loginRules, validate, controller.login);
router.get("/me", protect, controller.me);

module.exports = router;
