const router = require("express").Router();
const { body } = require("express-validator");
const controller = require("./users.controller");
const { protect } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/rbac");
const { validate } = require("../../middleware/validate");

router.use(protect, requireRole("admin")); // All user routes = admin only

router.get("/", controller.getAll);

router.patch(
  "/:id/role",
  [
    body("role")
      .isIn(["viewer", "analyst", "admin"])
      .withMessage("Invalid role"),
  ],
  validate,
  controller.updateRole,
);

router.patch(
  "/:id/status",
  [body("isActive").isBoolean().withMessage("isActive must be boolean")],
  validate,
  controller.updateStatus,
);

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password min 6 characters"),
  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("Invalid role"),
];

router.post("/", registerRules, validate, controller.create);

module.exports = router;
