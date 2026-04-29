// מודל מתכון: מגדיר את שדות המתכון, שכבות, וניהול בעלות.
const mongoose = require("mongoose");

const layerSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 250 },
    ingredients: [{ type: String, required: true, trim: true }],
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    categoryCodes: [{ type: String, required: true, uppercase: true, trim: true }],
    prepTimeMinutes: { type: Number, required: true, min: 1 },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    image: { type: String, default: "", trim: true },
    layers: { type: [layerSchema], default: [] },
    isPrivate: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
