const authRepository = require("../repositories/auth.repository");
const bcrypt = require("bcrypt");
const loginHistory = require("./loginHistory.service");
const notificationService = require("./notification.service");
const jwt = require("jsonwebtoken");
const AppError = require("../util/AppError");
const keyToken = process.env.JWT_SECRET;
if (!keyToken) {
  console.error("FATAL: JWT_SECRET environment variable is not set");
  process.exit(1);
}
//  REGISTER
exports.register = async (data) => {
  // Check username already exists
  const exist = await authRepository.findByUsername(data.username);

  if (exist) {
    throw new Error("Username already exists");
  }

  // Password complexity validation
  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Hash password
  data.password = bcrypt.hashSync(data.password, 10);

  // Force default role - never trust client input for role_id
  data.role_id = data.role_id || 3;

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
    await loginHistory.loginFailed(null, "Invalid credentials", req);
    throw new Error("Invalid username or password");
  }
  if (!user.is_active) {
    throw new AppError("Your account is inactive", 403);
  }
  const isCorrectPw = bcrypt.compareSync(password, user.password);
  // Password incorrect
  if (!isCorrectPw) {
    await loginHistory.loginFailed(user.id, "Invalid credentials", req);

    throw new Error("Invalid username or password");
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
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
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
