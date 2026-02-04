import ApiError from "../errors/ApiError.js";
import { ROLE_PERMISSIONS } from "../constants/permissions.constant.js";

const rbac = (permission) => (req, _res, next) => {
  const role = req.user.role;
  const permissions = ROLE_PERMISSIONS[role] || [];

  if (!permissions.includes(permission)) {
    throw ApiError.forbidden("Access denied");
  }

  next();
};

export default rbac;
