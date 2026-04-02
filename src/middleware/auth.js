const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(ApiError.unauthorized("No token provided"));
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) return next(ApiError.unauthorized("User no longer exists"));
    if (!user.isActive)
      return next(ApiError.unauthorized("Account is deactivated"));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError")
      return next(ApiError.unauthorized("Invalid token"));
    if (err.name === "TokenExpiredError")
      return next(ApiError.unauthorized("Token expired"));
    next(err);
  }
};

module.exports = { protect };
