const dashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res) => {
  try {
    const result = await dashboardService.getSummary();

    res.json({
      success: true,
      message: "Get dashboard summary successfully",
      data: result,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getSalesChart = async (req, res) => {
  try {
    const period = req.query.period || "monthly";

    const allowedPeriods = ["daily", "weekly", "monthly", "yearly"];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use daily, weekly, monthly, or yearly",
      });
    }

    const data = await dashboardService.getSalesChart(period);

    res.json({
      success: true,
      message: "Get sales chart successfully",
      period,
      data,
    });
  } catch (err) {
    console.error("Sales chart error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getProfitChart = async (req, res) => {
  try {
    const period = req.query.period || "monthly";

    const allowedPeriods = ["daily", "weekly", "monthly", "yearly"];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use daily, weekly, monthly, or yearly",
      });
    }

    const data = await dashboardService.getProfitChart(period);

    res.json({
      success: true,
      message: "Get profit chart successfully",
      period,
      data,
    });
  } catch (err) {
    console.error("Profit chart error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getRecentLoginActivity = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const data = await dashboardService.getRecentLoginActivity(limit);

    res.json({
      success: true,
      message: "Get recent login activity successfully",
      data,
    });
  } catch (err) {
    console.error("Recent login activity error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
