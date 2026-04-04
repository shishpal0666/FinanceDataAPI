const router = require("express").Router();
const controller = require("./dashboard.controller");
const { protect } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/rbac");

router.use(protect);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *
 * /dashboard/recent:
 *   get:
 *     summary: Get recent financial activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of recent records
 *
 * /dashboard/categories:
 *   get:
 *     summary: Get category-wise totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown data
 *
 * /dashboard/monthly:
 *   get:
 *     summary: Get monthly trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Monthly aggregate data
 *
 * /dashboard/weekly:
 *   get:
 *     summary: Get weekly trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly aggregate data
 */
router.get("/summary", controller.summary); // ALL roles
router.get("/recent", controller.recent); // ALL roles
router.get("/categories", requireRole("analyst"), controller.categories); // analyst+admin
router.get("/monthly", requireRole("analyst"), controller.monthly); // analyst+admin
router.get("/weekly", requireRole("analyst"), controller.weekly); // analyst+admin

module.exports = router;
