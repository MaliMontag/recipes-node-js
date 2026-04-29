// שירות קטגוריות: אחראי על סנכרון מתכונים מול קטגוריות.
const Category = require("../models/Category");

// מחשב מחדש את כמות המתכונים בכל קטגוריה.
async function recalculateRecipesCount() {
  const categories = await Category.find({}, "_id recipes");
  await Promise.all(
    categories.map((category) =>
      Category.updateOne({ _id: category._id }, { recipesCount: category.recipes.length })
    )
  );
}

// מסנכרן שיוך מתכון לקטגוריות לפי קודים שנשלחו.
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

// מסיר מתכון מכל הקטגוריות ומעדכן מונים.
async function removeRecipeFromCategories(recipeId) {
  await Category.updateMany({}, { $pull: { recipes: recipeId } });
  await recalculateRecipesCount();
}

module.exports = { syncCategoriesByCodes, removeRecipeFromCategories };
