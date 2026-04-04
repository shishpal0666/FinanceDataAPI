const User = require("../../models/User");
const AuditLog = require("../../models/AuditLog");
const ApiError = require("../../utils/ApiError");
const { paginate, paginateMeta } = require("../../utils/pagination");

const getAllUsers = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive) filter.isActive = query.isActive === "true";

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return { users, meta: paginateMeta(total, page, limit) };
};

const updateRole = async (targetId, newRole, adminId) => {
  const user = await User.findById(targetId);
  if (!user) throw ApiError.notFound("User not found");

  const oldRole = user.role;
  user.role = newRole;
  await user.save();

  await AuditLog.create({
    action: "UPDATE_USER_ROLE",
    entityType: "User",
    entityId: targetId,
    metadata: { from: oldRole, to: newRole },
    performedBy: adminId,
  });

  return user;
};

const updateStatus = async (targetId, isActive, adminId) => {
  const user = await User.findById(targetId);
  if (!user) throw ApiError.notFound("User not found");
  if (targetId === adminId.toString())
    throw ApiError.badRequest("Cannot deactivate yourself");

  user.isActive = isActive;
  await user.save();

  await AuditLog.create({
    action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    entityType: "User",
    entityId: targetId,
    performedBy: adminId,
  });

  return user;
};

const createUser = async (data, adminId) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw ApiError.badRequest("Email already in use");

  // Create user directly with role since Admin is creating them
  const user = await User.create(data);

  await AuditLog.create({
    action: "CREATE_USER",
    entityType: "User",
    entityId: user._id,
    metadata: {
      role: user.role,
      email: user.email,
    },
    performedBy: adminId,
  });

  // Convert to object and remove password for response
  const userObj = user.toObject();
  delete userObj.password;
  
  return userObj;
};

module.exports = { getAllUsers, updateRole, updateStatus, createUser };
