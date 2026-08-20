const paymentMethodService = require("../services/paymentMethod.service");

exports.getAll = async (req, res) => {
  try {
    const data = await paymentMethodService.getAll();

    res.json({
      success: true,
      message: "Get payment methods successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await paymentMethodService.getById(req.params.id);

    res.json({
      success: true,
      message: "Get payment method successfully",
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await paymentMethodService.create({
      name: req.body.name,
      type: req.body.type,
      is_active: req.body.is_active,
      create_by: req.current_id,
    });

    res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await paymentMethodService.update(
      req.params.id,
      {
        name: req.body.name,
        type: req.body.type,
        is_active: req.body.is_active,
      }
    );

    res.json({
      success: true,
      message: "Payment method updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = await paymentMethodService.updateStatus(
      req.params.id,
      req.body.is_active
    );

    res.json({
      success: true,
      message: "Payment method status updated successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};