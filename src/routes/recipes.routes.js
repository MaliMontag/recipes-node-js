const express = require("express");
const Recipe = require("../models/Recipe");
const validate = require("../middlewares/validate");
const { requireAuth, optionalAuth } = require("../middlewares/auth");
const { recipeSchema, listRecipesSchema, prepTimeSchema } = require("../validators/recipe.validator");
const createCode = require("../utils/createCode");
const AppError = require("../utils/appError");
const { syncCategoriesByCodes, removeRecipeFromCategories } = require("../services/category.service");

const router = express.Router();

function buildVisibilityFilter(user) {
  return user ? { $or: [{ isPrivate: false }, { createdBy: user._id }] } : { isPrivate: false };
}

router.get("/", optionalAuth, validate(listRecipesSchema, "query"), async (req, res, next) => {
  try {
    const { search = "", limit, page } = req.query;
    const skip = (page - 1) * limit;

    const visibilityFilter = buildVisibilityFilter(req.user);

    const textFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const filter = search ? { $and: [visibilityFilter, textFilter] } : visibilityFilter;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .populate("createdBy", "username email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      data: recipes,
    });
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/prep-time/:minutes",
  optionalAuth,
  validate(prepTimeSchema, "params"),
  async (req, res, next) => {
  try {
    const visibilityFilter = buildVisibilityFilter(req.user);
    const recipes = await Recipe.find({
      prepTimeMinutes: { $lte: Number(req.params.minutes) },
      ...visibilityFilter,
    }).sort({ prepTimeMinutes: 1 });
    return res.json(recipes);
  } catch (error) {
    return next(error);
  }
  }
);

router.get("/:code", optionalAuth, async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ code: req.params.code.toUpperCase() }).populate(
      "createdBy",
      "username email role"
    );

    if (!recipe) return next(new AppError("Recipe not found.", 404));

    const canView = !recipe.isPrivate || (req.user && recipe.createdBy._id.equals(req.user._id));
    if (!canView) return next(new AppError("Recipe is private.", 403));

    return res.json(recipe);
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, validate(recipeSchema), async (req, res, next) => {
  try {
    const recipe = await Recipe.create({
      ...req.body,
      code: createCode("REC"),
      createdBy: req.user._id,
    });

    await syncCategoriesByCodes(recipe.categoryCodes, recipe._id);
    return res.status(201).json(recipe);
  } catch (error) {
    return next(error);
  }
});

router.put("/:code", requireAuth, validate(recipeSchema), async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ code: req.params.code.toUpperCase() });
    if (!recipe) return next(new AppError("Recipe not found.", 404));

    const isOwner = recipe.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return next(new AppError("Insufficient permissions.", 403));
    }

    Object.assign(recipe, req.body);
    await recipe.save();
    await syncCategoriesByCodes(recipe.categoryCodes, recipe._id);

    return res.json(recipe);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:code", requireAuth, async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ code: req.params.code.toUpperCase() });
    if (!recipe) return next(new AppError("Recipe not found.", 404));

    const isOwner = recipe.createdBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return next(new AppError("Insufficient permissions.", 403));
    }

    await recipe.deleteOne();
    await removeRecipeFromCategories(recipe._id);
    return res.json({ message: "Recipe deleted successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
