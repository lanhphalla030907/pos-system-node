const employeeService = require("../services/employee.service");
//  GET ALL
exports.getAll = async (req, res) => {
  try {
    const data = await employeeService.getAll(req.query);

    res.json({
      success: true,

      message: "Get employees successfully",

      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

//  GET BY ID

exports.getById = async (req, res) => {
  try {
    const data = await employeeService.getById(req.params.id);

    res.json({
      success: true,

      message: "Get employee successfully",

      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,

      message: err.message,
    });
  }
};

//  CREATE

// CREATE
exports.create = async (req, res) => {
  try {
    const data = {
      ...req.body,

      image: req.file ? req.file.filename : null,

      create_by: req.current_id,
    };

    const result = await employeeService.create(data);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
//  UPDATE

// UPDATE
exports.update = async (req, res) => {
  try {
    const data = {
      ...req.body,
    };

    if (req.file) {
      data.image = req.file.filename;
    }

    const result = await employeeService.update(req.params.id, data);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
//  DELETE

exports.remove = async (req, res) => {
  try {
    const data = await employeeService.remove(req.params.id);

    res.json({
      success: true,

      message: data.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};

//  UPDATE STATUS

exports.updateStatus = async (req, res) => {
  try {
    const data = await employeeService.updateStatus(
      req.params.id,

      req.body.status,
    );

    res.json({
      success: true,

      message: data.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,

      message: err.message,
    });
  }
};
// CREATE EMPLOYEE ACCOUNT
exports.createAccount = async (req, res) => {
  try {
    const result = await employeeService.createAccount(req.params.id, {
      username: req.body.username,
      password: req.body.password,
      create_by: req.current_id,
    });
    res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
