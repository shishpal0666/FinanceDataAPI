const FinancialRecord = require("../../models/FinancialRecord");

const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = result.find((r) => r._id === "income") || {
    total: 0,
    count: 0,
  };
  const expense = result.find((r) => r._id === "expense") || {
    total: 0,
    count: 0,
  };

  const totalIncome = parseFloat(income.total.toFixed(2));
  const totalExpense = parseFloat(expense.total.toFixed(2));

  return {
    totalIncome,
    totalExpense,
    netBalance: parseFloat((totalIncome - totalExpense).toFixed(2)),
    incomeCount: income.count,
    expenseCount: expense.count,
  };
};

const getCategoryBreakdown = async () => {
  return FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);
};

const getMonthlyTrends = async (year) => {
  const targetYear = parseInt(year) || new Date().getFullYear();

  return FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        type: "$_id.type",
        total: 1,
        count: 1,
      },
    },
    { $sort: { month: 1 } },
  ]);
};

const getRecentActivity = async (limit = 10) => {
  return FinancialRecord.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
};

const getWeeklyTrends = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return FinancialRecord.aggregate([
    { $match: { isDeleted: false, date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: { _id: 0, day: "$_id.day", type: "$_id.type", total: 1 },
    },
    { $sort: { day: 1 } },
  ]);
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
};
