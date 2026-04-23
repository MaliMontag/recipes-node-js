const Category = require("../models/Category");

async function recalculateRecipesCount() {
  const categories = await Category.find({}, "_id recipes");
  await Promise.all(
    categories.map((category) =>
      Category.updateOne({ _id: category._id }, { recipesCount: category.recipes.length })
    )
  );
}

async function syncCategoriesByCodes(categoryCodes, recipeId) {
  const normalized = [...new Set(categoryCodes.map((item) => item.toUpperCase()))];

  for (const code of normalized) {
    await Category.findOneAndUpdate(
      { code },
      {
        $setOnInsert: {
          code,
          description: `Category ${code}`,
        },
        $addToSet: { recipes: recipeId },
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  await Category.updateMany(
    { code: { $nin: normalized } },
    { $pull: { recipes: recipeId } }
  );

  await recalculateRecipesCount();
}

async function removeRecipeFromCategories(recipeId) {
  await Category.updateMany({}, { $pull: { recipes: recipeId } });
  await recalculateRecipesCount();
}

module.exports = { syncCategoriesByCodes, removeRecipeFromCategories };
