const { validationResult } = require("express-validator");
const ApiResponse = require("../utils/ApiResponse");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // Return a structured array — easy for frontends to map to form field errors
    const errors = result.array().map((err) => ({
      field:   err.path,       // e.g. "email"
      message: err.msg,        // e.g. "Invalid email"
    }));

    return res.status(400).json(
      ApiResponse.fail("Validation failed", errors)
    );
  }
  next();
};

module.exports = { validate };
