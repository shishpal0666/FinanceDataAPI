const recordsService = require("./records.service");
const ApiResponse = require("../../utils/ApiResponse");

const create = async (req, res, next) => {
  try {
    const record = await recordsService.createRecord(req.body, req.user._id);
    res.status(201).json(ApiResponse.ok(record, "Record created"));
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await recordsService.getRecords(req.query);
    res.json(ApiResponse.ok(result.records, "Records fetched", result.meta));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const record = await recordsService.getRecordById(req.params.id);
    res.json(ApiResponse.ok(record));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const record = await recordsService.updateRecord(
      req.params.id,
      req.body,
      req.user._id,
    );
    res.json(ApiResponse.ok(record, "Record updated"));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await recordsService.softDeleteRecord(req.params.id, req.user._id);
    res.json(ApiResponse.ok(null, "Record deleted"));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getAll, getOne, update, remove };
