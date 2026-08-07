const roleRepository = require("../repositories/role.repository");
exports.getAll = async (query) => {
  return await roleRepository.getAll(query);
};
exports.getById = async (id) => {
  const role = await roleRepository.getById(id);

  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};
exports.create = async (data, user) => {
  // Validation
  if (!data.name || data.name.trim() === "") {
    throw new Error("Role name is required");
  }
  if (!data.code || data.code.trim() === "") {
    throw new Error("Role code is required");
  }
  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();
  // Duplicate name
  const nameExists = await roleRepository.existsByName(name);
  if (nameExists) {
    throw new Error("Role name already exists");
  }
  // Duplicate code
  const codeExists = await roleRepository.existsByCode(code);

  if (codeExists) {
    throw new Error("Role code already exists");
  }

  const id = await roleRepository.create({
    name,
    code,
    description: data.description || null,
    create_by: user.data.id,
  });

  return await roleRepository.getById(id);
};

exports.update = async (id, data) => {
  const role = await roleRepository.getById(id);

  if (!role) {
    throw new Error("Role not found");
  }

  if (!data.name || data.name.trim() === "") {
    throw new Error("Role name is required");
  }

  if (!data.code || data.code.trim() === "") {
    throw new Error("Role code is required");
  }

  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();

  const nameExists = await roleRepository.existsByName(name, id);

  if (nameExists) {
    throw new Error("Role name already exists");
  }
  const codeExists = await roleRepository.existsByCode(code, id);
  if (codeExists) {
    throw new Error("Role code already exists");
  }
  await roleRepository.update(id, {
    name,
    code,
    description: data.description || null,
  });
  return await roleRepository.getById(id);
};
/**
 * Delete role
 */
exports.remove = async (id) => {
  const role = await roleRepository.getById(id);
  if (!role) {
    throw new Error("Role not found");
  }
  const inUse = await roleRepository.isRoleInUse(id);
  if (inUse) {
    throw new Error("Role is assigned to users and cannot be deleted");
  }
  await roleRepository.remove(id);
  return true;
};
