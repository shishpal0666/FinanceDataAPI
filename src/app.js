require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/connectDB");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Route imports
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const recordsRoutes = require("./modules/records/records.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const swaggerUi   = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// Connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Global middleware
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiLimiter);

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Finance API Docs",
  swaggerOptions: {
    persistAuthorization: true, // keeps the JWT token across page refreshes
  },
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
