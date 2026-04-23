const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const AppError = require("../utils/appError");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required.", 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return next(new AppError("User from token not found.", 401));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token.", 401));
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id).select("-password");
    if (user) req.user = user;
    return next();
  } catch (error) {
    return next();
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions.", 403));
    }
    return next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
