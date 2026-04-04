const router = require("express").Router();
const controller = require("./dashboard.controller");
const { protect } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/rbac");

router.use(protect);

router.get("/summary", controller.summary); // ALL roles
router.get("/recent", controller.recent); // ALL roles
router.get("/categories", requireRole("analyst"), controller.categories); // analyst+admin
router.get("/monthly", requireRole("analyst"), controller.monthly); // analyst+admin
router.get("/weekly", requireRole("analyst"), controller.weekly); // analyst+admin

module.exports = router;
