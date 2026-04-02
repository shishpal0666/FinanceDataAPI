const ApiError = require("../utils/ApiError");

// Role hierarchy — higher number = more permissions
const ROLE_RANK = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

// requireRole("analyst") means analyst OR admin can access
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());

    const userRank = ROLE_RANK[req.user.role] ?? 0;
    const required = Math.min(...roles.map((r) => ROLE_RANK[r] ?? 99));

    if (userRank < required) {
      return next(
        ApiError.forbidden(
          `This action requires one of: ${roles.join(", ")}. Your role: ${req.user.role}`,
        ),
      );
    }
    next();
  };
};

module.exports = { requireRole };
