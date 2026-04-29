// סכמות ולידציה ליצירה, עדכון וסינון של מתכונים.
const Joi = require("joi");

const layerSchema = Joi.object({
  description: Joi.string().max(250).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).required(),
});

const recipeSchema = Joi.object({
  name: Joi.string().max(120).required(),
  description: Joi.string().max(1000).required(),
  categoryCodes: Joi.array().items(Joi.string().trim().uppercase()).min(1).required(),
  prepTimeMinutes: Joi.number().integer().min(1).required(),
  difficulty: Joi.number().integer().min(1).max(5).required(),
  image: Joi.string().allow("").optional(),
  layers: Joi.array().items(layerSchema).default([]),
  isPrivate: Joi.boolean().optional(),
});

const listRecipesSchema = Joi.object({
  search: Joi.string().allow("").optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
});

const prepTimeSchema = Joi.object({
  minutes: Joi.number().integer().min(1).required(),
});

module.exports = { recipeSchema, listRecipesSchema, prepTimeSchema };
