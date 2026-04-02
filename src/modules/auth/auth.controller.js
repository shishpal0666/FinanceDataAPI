const authService = require("./auth.service");
const ApiResponse = require("../../utils/ApiResponse");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(ApiResponse.ok(result, "Registration successful"));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(ApiResponse.ok(result, "Login successful"));
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.status(200).json(ApiResponse.ok(req.user, "Current user"));
};

module.exports = { register, login, me };
