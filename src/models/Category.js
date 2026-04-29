// מודל קטגוריה: מגדיר קוד, תיאור, שיוכי מתכונים ומונה כמות.
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    recipesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
