const orderPaymentService = require("../services/orderPayment.service");

// GET PAYMENTS BY ORDER
exports.getByOrderId = async (req, res) => {
  try {
    const data = await orderPaymentService.getByOrderId(
      req.params.orderId
    );

    res.json({
      success: true,
      message: "Get order payments successfully",
      data,
    });
  } catch (err) {
    console.error("Get order payments error:", err);

    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// GET PAYMENT BY ID
exports.getById = async (req, res) => {
  try {
    const data = await orderPaymentService.getById(
      req.params.id
    );

    res.json({
      success: true,
      message: "Get order payment successfully",
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// CREATE PAYMENT
exports.create = async (req, res) => {
  try {
    const data = await orderPaymentService.create({
      ...req.body,
      create_by: req.current_id,
    });

    res.status(201).json({
      success: true,
      message: "Order payment created successfully",
      data,
    });
  } catch (err) {
    console.error("Create order payment error:", err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};