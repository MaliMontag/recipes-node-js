const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },
    role: {
      type: String,
      enum: ["admin", "registered"],
      default: "registered",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
