// נתיבי אימות: הרשמה והתחברות משתמשים.
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const AppError = require("../utils/appError");

const router = express.Router();

// יוצר משתמש חדש לאחר ולידציה והצפנת סיסמה.
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { username, email, password, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already exists.", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      address,
      role: "registered",
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return next(error);
  }
});

// מאמת פרטי התחברות ומחזיר JWT למשתמש קיים.
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
