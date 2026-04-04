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

module.exports = router;
