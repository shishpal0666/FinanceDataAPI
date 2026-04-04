const dashService = require("./dashboard.service");
const ApiResponse = require("../../utils/ApiResponse");

const summary = async (req, res, next) => {
  try {
    res.json(ApiResponse.ok(await dashService.getSummary()));
  } catch (err) {
    next(err);
  }
};

const categories = async (req, res, next) => {
  try {
    res.json(ApiResponse.ok(await dashService.getCategoryBreakdown()));
  } catch (err) {
    next(err);
  }
};

const monthly = async (req, res, next) => {
  try {
    res.json(
      ApiResponse.ok(await dashService.getMonthlyTrends(req.query.year)),
    );
  } catch (err) {
    next(err);
  }
};

const recent = async (req, res, next) => {
  try {
    res.json(
      ApiResponse.ok(await dashService.getRecentActivity(req.query.limit)),
    );
  } catch (err) {
    next(err);
  }
};

const weekly = async (req, res, next) => {
  try {
    res.json(ApiResponse.ok(await dashService.getWeeklyTrends()));
  } catch (err) {
    next(err);
  }
};

module.exports = { summary, categories, monthly, recent, weekly };
