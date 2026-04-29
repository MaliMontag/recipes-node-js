// סכמות ולידציה לזרימות אימות: הרשמה, התחברות ועדכון סיסמה.
const Joi = require("joi");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must include upper/lower letters, number, and special character.",
  }),
  address: Joi.string().max(150).allow("").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().optional().allow(""),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must include upper/lower letters, number, and special character.",
  }),
});

module.exports = { registerSchema, loginSchema, updatePasswordSchema };
