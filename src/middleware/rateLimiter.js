const rateLimit = require("express-rate-limit");

// Dummy limiter for testing
const passThrough = (req, res, next) => next();

// Strict limiter for auth routes
const authLimiter = process.env.NODE_ENV === "test" ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const apiLimiter = process.env.NODE_ENV === "test" ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
