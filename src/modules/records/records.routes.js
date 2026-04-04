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

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:      { type: number,  example: 1500 }
 *               type:        { type: string,  enum: [income, expense] }
 *               category:    { type: string,  example: Salary }
 *               date:        { type: string,  format: date-time }
 *               description: { type: string,  example: Monthly salary }
 *     responses:
 *       201:
 *         description: Record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/FinancialRecord' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden – viewer role cannot create records
 *
 *   get:
 *     summary: List financial records (paginated, filterable)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of records with pagination metadata
 */
router.get("/", controller.getAll); // ALL roles
router.get("/:id", controller.getOne); // ALL roles

router.post(
  "/",
  requireRole("analyst"), // analyst + admin
  recordRules,
  validate,
  controller.create,
);

router.patch(
  "/:id",
  requireRole("analyst"), // analyst + admin
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
