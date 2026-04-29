// נתיבי קטגוריות: שליפה בסיסית ושליפה עם מתכונים לפי הרשאות צפייה.
const express = require("express");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const AppError = require("../utils/appError");
const { optionalAuth } = require("../middlewares/auth");

const router = express.Router();

// מגדיר אילו מתכונים ניתנים לצפייה לפי מצב התחברות.
function recipeVisibilityFilter(user) {
  return user ? { $or: [{ isPrivate: false }, { createdBy: user._id }] } : { isPrivate: false };
}

// מחזיר את כל הקטגוריות לפי סדר קוד עולה.
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ code: 1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

// מחזיר כל קטגוריה עם רשימת המתכונים המותרים לצפייה.
router.get("/with-recipes", optionalAuth, async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ code: 1 }).lean();
    const visibility = recipeVisibilityFilter(req.user);

    const categoriesWithRecipes = await Promise.all(
      categories.map(async (category) => {
        const recipes = await Recipe.find({
          _id: { $in: category.recipes },
          ...visibility,
        }).sort({ createdAt: -1 });

        return {
          ...category,
          recipes,
          recipesCount: recipes.length,
        };
      })
    );

    return res.json(categoriesWithRecipes);
  } catch (error) {
    return next(error);
  }
});

// מחזיר קטגוריה ספציפית לפי קוד או תיאור, כולל מתכונים תואמים.
router.get("/:identifier", optionalAuth, async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const category = await Category.findOne({
      $or: [{ code: identifier.toUpperCase() }, { description: { $regex: `^${escaped}$`, $options: "i" } }],
    }).lean();

    if (!category) return next(new AppError("Category not found.", 404));

    const visibility = recipeVisibilityFilter(req.user);
    const recipes = await Recipe.find({
      categoryCodes: category.code,
      ...visibility,
    }).sort({ createdAt: -1 });

    return res.json({
      ...category,
      recipes,
      recipesCount: recipes.length,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
