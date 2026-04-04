const usersService = require("./users.service");
const ApiResponse = require("../../utils/ApiResponse");

const getAll = async (req, res, next) => {
  try {
    const result = await usersService.getAllUsers(req.query);
    res.json(ApiResponse.ok(result.users, "Users fetched", result.meta));
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const user = await usersService.updateRole(
      req.params.id,
      req.body.role,
      req.user._id,
    );
    res.json(ApiResponse.ok(user, "Role updated"));
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const user = await usersService.updateStatus(
      req.params.id,
      req.body.isActive,
      req.user._id,
    );
    res.json(ApiResponse.ok(user, "Status updated"));
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, updateRole, updateStatus };
