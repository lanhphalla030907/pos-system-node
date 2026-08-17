const settingsService = require("../services/settings.service");

exports.getAll = async (req, res) => {
  try {
    const data = await settingsService.getAll();

    res.json({
      success: true,
      message: "Get settings successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await settingsService.update(req.body, req.current_id);

    res.json({
      success: true,
      message: "Settings updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadLogo = async (req, res) => {
  try {
    const filename = await settingsService.uploadLogo(req);

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: { store_logo: filename },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
