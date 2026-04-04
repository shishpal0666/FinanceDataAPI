const router = require("express").Router();
const { body } = require("express-validator");
const controller = require("./records.controller");
const { protect } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/rbac");
const { validate } = require("../../middleware/validate");

const recordRules = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("date").isISO8601().withMessage("Date must be a valid ISO8601 date"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description max 500 chars"),
];

// Separate rules for PATCH — all fields optional (fresh instances, no mutation)
const updateRecordRules = [
  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number"),
  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description max 500 chars"),
];

router.use(protect);

router.get("/", requireRole("analyst"), controller.getAll); // analyst + admin
router.get("/:id", requireRole("analyst"), controller.getOne); // analyst + admin

router.post(
  "/",
  requireRole("admin"), // admin only
  recordRules,
  validate,
  controller.create,
);

router.patch(
  "/:id",
  requireRole("admin"), // admin only
  updateRecordRules,
  validate,
  controller.update,
);

router.delete(
  "/:id",
  requireRole("admin"), // admin only
  controller.remove,
);

module.exports = router;
