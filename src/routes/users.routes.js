// נתיבי משתמשים: ניהול משתמשים, סיסמאות ומחיקה עם הרשאות.
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { updatePasswordSchema } = require("../validators/auth.validator");
const AppError = require("../utils/appError");

const router = express.Router();

// מחזיר את כל המשתמשים (ללא סיסמאות) למנהל מערכת בלבד.
router.get("/", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.put(
  "/:id/password",
  requireAuth,
  validate(updatePasswordSchema),
  // מעדכן סיסמה למשתמש עצמו או לאדמין, עם בדיקות אבטחה מתאימות.
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      const canUpdate = req.user.role === "admin" || req.user._id.toString() === id;

      if (!canUpdate) return next(new AppError("Insufficient permissions.", 403));

      const user = await User.findById(id);
      if (!user) return next(new AppError("User not found.", 404));

      if (req.user.role !== "admin") {
        if (!oldPassword) return next(new AppError("Old password is required.", 400));
        const isOldValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldValid) return next(new AppError("Old password is incorrect.", 400));
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({ message: "Password updated successfully." });
    } catch (error) {
      return next(error);
    }
  }
);

// מוחק משתמש אם הפונה הוא המשתמש עצמו או מנהל מערכת.
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const canDelete = req.user.role === "admin" || req.user._id.toString() === id;
    if (!canDelete) return next(new AppError("Insufficient permissions.", 403));

    const user = await User.findByIdAndDelete(id);
    if (!user) return next(new AppError("User not found.", 404));

    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
