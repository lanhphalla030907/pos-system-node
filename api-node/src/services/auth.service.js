const authRepository = require("../repositories/auth.repository");
const bcrypt = require("bcrypt");
const loginHistory = require("./loginHistory.service");
const notificationService = require("./notification.service");
const jwt = require("jsonwebtoken");
const keyToken = "LWEJROI32209";
//  REGISTER
exports.register = async (data) => {
  // Check username already exists
  const exist = await authRepository.findByUsername(data.username);

  if (exist) {
    throw new Error("Username already exists");
  }

  // Hash password
  data.password = bcrypt.hashSync(data.password, 10);

  // Default active
  if (data.is_active === undefined) {
    data.is_active = 1;
  }

  const id = await authRepository.create(data);

  return {
    id,
    message: "Register success",
  };
};

exports.login = async (username, password, req) => {
  const user = await authRepository.findByUsername(username);
  // Username not found
  if (!user) {
    await loginHistory.loginFailed(null, "Username not found", req);
    throw new Error("Username not found");
  }
  if (!user.is_active) {
  throw new AppError("Your account is inactive", 403);
}
  const isCorrectPw = bcrypt.compareSync(password, user.password);
  // Password incorrect
  if (!isCorrectPw) {
    await loginHistory.loginFailed(user.id, "Password not match", req);

    throw new Error("Password not match");
  }

  delete user.password;

  const access_token = await createAccessToken(user);

  // Login success
  await loginHistory.loginSuccess(user, req);

  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null;
    await notificationService.notifyLoginEvent({
      user_id: user.id,
      status: "success",
      ip_address: ip,
    });
  } catch (error) {
    console.error("Login notification failed:", error.message);
  }

  return {
    user,
    access_token,
  };
};
//  PROFILE
exports.getProfile = async (id) => {
  const user = await authRepository.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

//  UPDATE STATUS
exports.updateStatus = async (id, is_active) => {
  if (is_active != 0 && is_active != 1) {
    throw new Error("is_active must be 0 or 1");
  }

  const affectedRows = await authRepository.updateStatus(id, is_active);

  if (affectedRows === 0) {
    throw new Error("User not found");
  }

  return {
    message: "User status updated successfully",
  };
};

//  CHANGE PASSWORD
exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await authRepository.findByIdRaw(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isCorrect = bcrypt.compareSync(currentPassword, user.password);
  if (!isCorrect) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  await authRepository.updatePassword(userId, hashedPassword);

  return { message: "Password changed successfully" };
};

//  CREATE TOKEN
const createAccessToken = async (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    username: user.username,
  };

  return jwt.sign({ data: payload }, keyToken, {
    expiresIn: "7d",
  });
};
exports.getList = async () => {
  const result = await authRepository.getList();
  return result;
};
//  VALIDATE TOKEN
exports.validateToken = () => {
  return (req, res, next) => {
    const authorization = req.headers.authorization;

    let token = null;

    if (authorization) {
      token = authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    jwt.verify(token, keyToken, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      req.user = decoded;
      req.current_id = decoded.data.id;
      req.current_name = decoded.data.name;
      req.current_username = decoded.data.username;

      next();
    });
  };
};
