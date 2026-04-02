const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const register = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email already registered");

  // Only admins can assign admin role — handled at route level
  const user = await User.create({
    name,
    email,
    password,
    role: role || "viewer",
  });
  const token = signToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");

  const token = signToken(user._id);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

module.exports = { register, login };
