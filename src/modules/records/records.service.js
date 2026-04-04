const FinancialRecord = require("../../models/FinancialRecord");
const AuditLog = require("../../models/AuditLog");
const ApiError = require("../../utils/ApiError");
const { paginate, paginateMeta } = require("../../utils/pagination");

const buildFilter = (query) => {
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(query.category, "i");
  if (query.search) {
    filter.$or = [
      { category: new RegExp(query.search, "i") },
      { description: new RegExp(query.search, "i") },
    ];
  }
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  return filter;
};

const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, createdBy: userId });

  await AuditLog.create({
    action: "CREATE_RECORD",
    entityType: "FinancialRecord",
    entityId: record._id.toString(),
    metadata: { amount: data.amount, type: data.type },
    performedBy: userId,
  });

  return record;
};

const getRecords = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = buildFilter(query);

  const sortField = query.sortBy || "date";
  const sortOrder = query.order === "asc" ? 1 : -1;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder }),
    FinancialRecord.countDocuments(filter),
  ]);

  return { records, meta: paginateMeta(total, page, limit) };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate(
    "createdBy",
    "name email",
  );
  if (!record) throw ApiError.notFound("Record not found");
  return record;
};

const updateRecord = async (id, data, userId) => {
  const record = await FinancialRecord.findById(id);
  if (!record) throw ApiError.notFound("Record not found");

  const updatedRecord = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  await AuditLog.create({
    action: "UPDATE_RECORD",
    entityType: "FinancialRecord",
    entityId: id,
    metadata: { changes: data },
    performedBy: userId,
  });

  return updatedRecord;
};

const softDeleteRecord = async (id, userId) => {
  const record = await FinancialRecord.findById(id);
  if (!record) throw ApiError.notFound("Record not found");

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  await AuditLog.create({
    action: "DELETE_RECORD",
    entityType: "FinancialRecord",
    entityId: id,
    performedBy: userId,
  });

  return { message: "Record deleted successfully" };
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};
