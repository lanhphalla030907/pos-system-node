const authService = require("../services/auth.service");

//  GET ALL USERS 
exports.getList = async (req, res) => {
  try {
    const list = await authService.getList();

    res.json({
      success: true,
      message: "Get users successfully",
      data: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//  REGISTER 
exports.register = async (req, res) => {
  try {
    const result = await authService.register({
      ...req.body,
      create_by: req.current_id,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//  LOGIN 
exports.login = async (req, res) => {
  try {
    const result = await authService.login(
      req.body.username,
      req.body.password
    );

    res.json({
      success: true,
      message: "Login success",
      data: result.user,
      access_token: result.access_token,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//  PROFILE 
exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.current_id);

    res.json({
      success: true,
      message: "Profile",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//  UPDATE STATUS 
exports.updateStatus = async (req, res) => {
  try {
    const result = await authService.updateStatus(
      req.params.id,
      req.body.is_active
    );

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

//  VALIDATE TOKEN 
exports.validate_token = authService.validateToken;