const permissionRepository = require("../repositories/permission.repository");
exports.getAll = async (query) => {
  return await permissionRepository.getAll(query);
};

exports.getById = async (id) => {
  const permission = await permissionRepository.getById(id);
  if (!permission) {
    throw new Error("Permission not found");
  }
  return permission;
};

exports.create = async (data, user) => {
  // Required validation
  if (!data.name || data.name.trim() === "") {
    throw new Error("Permission name is required");
  }
  if (!data.code || data.code.trim() === "") {
    throw new Error("Permission code is required");
  }
  if (!data.module || data.module.trim() === "") {
    throw new Error("Permission module is required");
  }
  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();
  const module = data.module.trim();
  // Duplicate name
  const nameExists = await permissionRepository.existsByName(name);
  if (nameExists) {
    throw new Error("Permission name already exists");
  }
  // Duplicate code
  const codeExists = await permissionRepository.existsByCode(code);
  if (codeExists) {
    throw new Error("Permission code already exists");
  }
  const id = await permissionRepository.create({
    name,
    code,
    module,
    description: data.description || null,
    create_by: user.data.id,
  });

  return await permissionRepository.getById(id);
};
exports.update = async (id, data) => {
  const permission = await permissionRepository.getById(id);
  if (!permission) {
    throw new Error("Permission not found");
  }
  if (!data.name || data.name.trim() === "") {
    throw new Error("Permission name is required");
  }
  if (!data.code || data.code.trim() === "") {
    throw new Error("Permission code is required");
  }
  if (!data.module || data.module.trim() === "") {
    throw new Error("Permission module is required");
  }
  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();
  const module = data.module.trim();
  const nameExists = await permissionRepository.existsByName(name, id);
  if (nameExists) {
    throw new Error("Permission name already exists");
  }
  const codeExists = await permissionRepository.existsByCode(code, id);
  if (codeExists) {
    throw new Error("Permission code already exists");
  }
  await permissionRepository.update(id, {
    name,
    code,
    module,
    description: data.description || null,
  });
  return await permissionRepository.getById(id);
};
exports.remove = async (id) => {
  const permission = await permissionRepository.getById(id);
  if (!permission) {
    throw new Error("Permission not found");
  }
  const used = await permissionRepository.isPermissionInUse(id);
  if (used) {
    throw new Error("Permission is assigned to role and cannot be deleted");
  }
  await permissionRepository.remove(id);
  return true;
};
