const employeeRepository = require("../repositories/employee.repository");
const imageStorage = require("./storage/image-storage.service");
const { db } = require("../util/helper");
const authService = require("./auth.service");
// Generate Employee Code
const generateCode = async () => {
  const [rows] = await db.query(`
    SELECT MAX(id) AS id
    FROM employee
  `);

  const nextId = (rows[0].id || 0) + 1;

  return "EMP-" + String(nextId).padStart(6, "0");
};

// Check Role
const checkRole = async (role_id) => {
  const [rows] = await db.query(
    `
    SELECT id
    FROM role
    WHERE id = ?
    `,
    [role_id]
  );

  if (rows.length === 0) {
    throw new Error("Role not found");
  }
};

// Get All
exports.getAll = async (query) => {
  return await employeeRepository.getAll(query);
};

// Get By ID
exports.getById = async (id) => {
  const employee = await employeeRepository.getById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

// Create
exports.create = async (data, file) => {
  if (!data.name) {
    throw new Error("Employee name is required");
  }

  if (!data.role_id) {
    throw new Error("Role is required");
  }

  await checkRole(data.role_id);

  // Generate Employee Code
  data.code = await generateCode();

  // Default Status
  if (data.status === undefined) {
    data.status = 1;
  }

  // User is optional
  if (!data.user_id) {
    data.user_id = null;
  }

  let uploadedImage = null;
  if (file) {
    uploadedImage = await imageStorage.uploadImage(file, "employee");
    data.image = uploadedImage.image;
    data.image_public_id = uploadedImage.publicId;
  } else {
    data.image = null;
    data.image_public_id = null;
  }

  let id;
  try {
    id = await employeeRepository.create(data);
  } catch (error) {
    if (uploadedImage) {
      await imageStorage.safeDeleteImage(
        {
          image: uploadedImage.image,
          publicId: uploadedImage.publicId,
          folderKey: "employee",
        },
        "employee create rollback",
      );
    }
    throw error;
  }

  return {
    id,
    code: data.code,
    message: "Employee created successfully",
  };
};

// Update
exports.update = async (id, data, file) => {
  const employee = await employeeRepository.getById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (data.role_id) {
    await checkRole(data.role_id);
  }

  if (!data.user_id) {
    data.user_id = null;
  }

  let uploadedImage = null;
  if (file) {
    uploadedImage = await imageStorage.uploadImage(file, "employee");
    data.image = uploadedImage.image;
    data.image_public_id = uploadedImage.publicId;
  } else {
    // No new upload: preserve the existing image reference.
    data.image = employee.image;
    data.image_public_id = employee.image_public_id || null;
  }

  try {
    await employeeRepository.update(id, data);
  } catch (error) {
    if (uploadedImage) {
      await imageStorage.safeDeleteImage(
        {
          image: uploadedImage.image,
          publicId: uploadedImage.publicId,
          folderKey: "employee",
        },
        "employee update rollback",
      );
    }
    throw error;
  }

  if (uploadedImage) {
    await imageStorage.safeDeleteImage(
      {
        image: employee.image,
        publicId: employee.image_public_id || null,
        folderKey: "employee",
      },
      `employee ${id} image replacement`,
    );
  }

  return {
    message: "Employee updated successfully",
  };
};

// Delete
exports.remove = async (id) => {
  const employee = await employeeRepository.getById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Delete the database row first. If that fails, the image stays intact.
  await employeeRepository.remove(id);

  await imageStorage.safeDeleteImage(
    {
      image: employee.image,
      publicId: employee.image_public_id || null,
      folderKey: "employee",
    },
    `employee ${id} deletion`,
  );

  return {
    message: "Employee deleted successfully",
  };
};

// Update Status
exports.updateStatus = async (id, status) => {
  const employee = await employeeRepository.getById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (status !== 0 && status !== 1) {
    throw new Error("Status must be 0 or 1");
  }

  await employeeRepository.updateStatus(id, status);

  return {
    message: "Employee status updated successfully",
  };
};
// Create Employee Account
exports.createAccount = async (employee_id, data) => {
  // Check employee
  const employee = await employeeRepository.checkUserAccount(employee_id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Check already has account
  if (employee.user_id) {
    throw new Error("Employee already has an account");
  }

  // Create user account
  const result = await authService.register({
    role_id: employee.role_id,
    name: employee.name,
    username: data.username,
    password: data.password,
    is_active: 1,
    create_by: data.create_by,
  });

  // Link user to employee
  await employeeRepository.assignUser(employee_id, result.id);

  return {
    message: "Employee account created successfully",
  };
};