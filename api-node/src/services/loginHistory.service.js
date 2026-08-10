const loginHistoryRepository = require("../repositories/loginHistory.repository");
const telegramService = require("./telegram.service");

const getClientInfo = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;

  const userAgent = req.headers["user-agent"] || null;

  return {
    ip_address: ip,
    user_agent: userAgent,
  };
};

// LOGIN SUCCESS
exports.loginSuccess = async (user, req) => {
  const client = getClientInfo(req);

  // Save DB
  await loginHistoryRepository.create({
    user_id: user.id,
    action: "LOGIN",
    status: "success",
    ip_address: client.ip_address,
    user_agent: client.user_agent,
    message: "Login successfully",
  });

  // Telegram
  try {
    await telegramService.sendLoginAlert({
      user,
      status: "success",
      ip_address: client.ip_address,
      user_agent: client.user_agent,
      message: "Login successfully",
    });
  } catch (error) {
    console.error("Telegram success alert failed:", error.message);
  }
};
// LOGIN FAILED
exports.loginFailed = async (userId, message, req) => {
  const client = getClientInfo(req);

  // Save DB
  await loginHistoryRepository.create({
    user_id: userId,
    action: "LOGIN",
    status: "failed",
    ip_address: client.ip_address,
    user_agent: client.user_agent,
    message,
  });

  // Telegram
  try {
    await telegramService.sendLoginAlert({
      user: {
        id: userId,
        name: userId ? "Known User" : "Unknown User",
        username: userId ? "Known User" : "Unknown",
      },
      status: "failed",
      ip_address: client.ip_address,
      user_agent: client.user_agent,
      message,
    });
  } catch (error) {
    console.error("Telegram failed alert failed:", error.message);
  }
};
exports.getRecent = async (limit = 10) => {
  return await loginHistoryRepository.getRecent(limit);
};