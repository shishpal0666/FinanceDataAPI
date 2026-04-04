const FinancialRecord = require("../../models/FinancialRecord");
const AuditLog = require("../../models/AuditLog");
const ApiError = require("../../utils/ApiError");
const withTransaction = require("../../utils/withTransaction");
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
  return withTransaction(async (session) => {
    // Model.create() with a session requires an array
    const [record] = await FinancialRecord.create(
      [{ ...data, createdBy: userId }],
      { session },
    );

    await AuditLog.create(
      [
        {
          action: "CREATE_RECORD",
          entityType: "FinancialRecord",
          entityId: record._id.toString(),
          metadata: {
            amount: data.amount,
            type: data.type,
            category: data.category,
          },
          performedBy: userId,
        },
      ],
      { session },
    );

    return record;
  });
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
  return withTransaction(async (session) => {
    const record = await FinancialRecord.findById(id).session(session);
    if (!record) throw ApiError.notFound("Record not found");

    const updated = await FinancialRecord.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      session,
    });

    await AuditLog.create(
      [
        {
          action: "UPDATE_RECORD",
          entityType: "FinancialRecord",
          entityId: id,
          metadata: { changes: data },
          performedBy: userId,
        },
      ],
      { session },
    );

    return updated;
  });
};

const softDeleteRecord = async (id, userId) => {
  return withTransaction(async (session) => {
    const record = await FinancialRecord.findById(id).session(session);
    if (!record) throw ApiError.notFound("Record not found");

    await FinancialRecord.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { session },
    );

    await AuditLog.create(
      [
        {
          action: "DELETE_RECORD",
          entityType: "FinancialRecord",
          entityId: id,
          performedBy: userId,
        },
      ],
      { session },
    );
  });
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
};
