const express = require("express");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const AppError = require("../utils/appError");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ code: 1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.get("/with-recipes", async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate({
        path: "recipes",
        model: "Recipe",
      })
      .sort({ code: 1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

router.get("/:identifier", async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const category = await Category.findOne({
      $or: [{ code: identifier.toUpperCase() }, { description: identifier }],
    }).populate("recipes");

    if (!category) return next(new AppError("Category not found.", 404));

    if (!category.recipes.length) {
      const recipes = await Recipe.find({ categoryCodes: category.code });
      category.recipes = recipes;
    }

    return res.json(category);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
