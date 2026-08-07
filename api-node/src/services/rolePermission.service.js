const rolePermissionRepository = require("../repositories/rolePermission.repository");
const roleRepository = require("../repositories/role.repository");
const permissionRepository = require("../repositories/permission.repository");
exports.getPermissionsByRole = async (role_id) => {
  const role = await roleRepository.getById(role_id);

  if (!role) {
    throw new Error("Role not found");
  }

  return await rolePermissionRepository.getPermissionsByRole(role_id);
};

exports.assignPermissions = async (role_id, permissionIds, user) => {
  // Check role

  const role = await roleRepository.getById(role_id);

  if (!role) {
    throw new Error("Role not found");
  }

  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    throw new Error("Permissions are required");
  }

  const assigned = [];

  for (const permission_id of permissionIds) {
    const permission = await permissionRepository.getById(permission_id);

    if (!permission) {
      throw new Error(`Permission ${permission_id} not found`);
    }

    const exists = await rolePermissionRepository.exists(
      role_id,
      permission_id,
    );

    if (!exists) {
      await rolePermissionRepository.assign(
        role_id,
        permission_id,
        user.data.id,
      );

      assigned.push(permission_id);
    }
  }

  return {
    role_id,

    added_permissions: assigned,
  };
};


exports.removePermission = async (role_id, permission_id) => {
  const role = await roleRepository.getById(role_id);

  if (!role) {
    throw new Error("Role not found");
  }
  const result = await rolePermissionRepository.remove(role_id, permission_id);
  if (!result) {
    throw new Error("Permission not assigned to this role");
  }
  return true;
};
