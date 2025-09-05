import { InputRecipe, Recipe } from "@shared/types/recipe";
import { db } from "../index";
import {
  recipeCookTipsTable,
  recipeImagesTable,
  recipeIngredientsTable,
  recipeInstructionsTable,
  recipesTable,
  recipeTagsTable,
} from "@drizzle/schemas/recipes";
import { eq } from "drizzle-orm";
//If imageURL has a constraint like CHECK (imageURL ~ '^https?://')
export async function insertRecipe(
  recipe: InputRecipe,
  userID: string
): Promise<string | undefined> {
  try {
    const formattedRecipe = {
      ...recipe,
      authorID: userID,

      prep_hrs: recipe.prep.hrs,
      prep_mins: recipe.prep.mins,

      cook_hrs: recipe.cook.hrs,
      cook_mins: recipe.cook.mins,
    };
    const [settedRecipe] = await db
      .insert(recipesTable)
      .values(formattedRecipe)
      .returning();
    if (!settedRecipe || !settedRecipe.id) {
      throw new Error("Recipe insert failed");
    }
    const recipeID: string = settedRecipe.id;

    // IMAGES
    const recipeImages = recipe.imageURL.map((url) => ({
      imageURL: url,
      recipeID: recipeID,
    }));

    const settedImages = await db
      .insert(recipeImagesTable)
      .values(recipeImages)
      .returning();
    if (settedImages.length !== recipeImages.length) {
      throw new Error(`Recipe's image  insert failed. Recipe id: ${recipeID}`);
    }

    // COOK TIPS
    const cookTips = recipe.cookTips.map((tip) => ({
      tip: tip,
      recipeID: recipeID,
    }));
    const settedCookTips = await db
      .insert(recipeCookTipsTable)
      .values(cookTips)
      .returning();
    if (settedCookTips.length !== cookTips.length) {
      throw new Error(
        `Recipe's cook tips  insert failed. Recipe id: ${recipeID}`
      );
    }

    // INSTRUCTIONS
    const instructions = recipe.instructions.map((instruction, index) => ({
      recipeID: recipeID,
      step: index + 1,
      instruction: instruction.step,
    }));
    const settedInstructions = await db
      .insert(recipeInstructionsTable)
      .values(instructions)
      .returning();
    if (settedInstructions.length !== instructions.length) {
      throw new Error(
        `Recipe's instruction insert failed. Recipe id: ${recipeID}`
      );
    }

    // INGREDIENTS
    const ingredients = recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity.toString(),
      recipeID: recipeID,
      unit: ing.unit,
    }));

    const settedIngredients = await db
      .insert(recipeIngredientsTable)
      .values(ingredients)
      .returning();

    if (settedIngredients.length !== ingredients.length) {
      throw new Error(`Recipe's tags insert failed. Recipe id: ${recipeID}`);
    }

    // TAGS
    const tags = recipe.tags.map((tag) => ({
      name: tag,
      recipeID: recipeID,
    }));
    const settedTags = await db
      .insert(recipeTagsTable)
      .values(tags)
      .returning();
    if (settedTags.length !== tags.length) {
      throw new Error(`Recipe's tags insert failed. Recipe id: ${recipeID}`);
    }

    return recipeID;
  } catch (err: unknown) {
    throw err;
  }
}

export async function findRecipeByTitle(
  title: string
): Promise<Recipe | undefined> {
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.title, title));
  if (!recipe) return undefined;
  const id: string = recipe.id;
  const images = await db
    .select()
    .from(recipeImagesTable)
    .where(eq(recipeImagesTable.recipeID, id));
  const instructions = await db
    .select()
    .from(recipeInstructionsTable)
    .where(eq(recipeInstructionsTable.recipeID, id));
  const ingredients = await db
    .select()
    .from(recipeIngredientsTable)
    .where(eq(recipeIngredientsTable.recipeID, id));
  const tags = await db
    .select()
    .from(recipeTagsTable)
    .where(eq(recipeTagsTable.recipeID, id));
  const cookTips = await db
    .select()
    .from(recipeCookTipsTable)
    .where(eq(recipeCookTipsTable.recipeID, id));
  if (
    images.length === 0 ||
    instructions.length === 0 ||
    ingredients.length === 0 ||
    tags.length === 0 ||
    cookTips.length === 0
  ) {
    return undefined;
  }
  const result = {
    id: recipe.id,
    imageURL: images.map((img) => img.imageURL),
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prep: {
      hrs: recipe.prep_hrs,
      mins: recipe.prep_mins,
    },
    cook: {
      hrs: recipe.cook_hrs,
      mins: recipe.cook_mins,
    },
    tags: tags.map((tag) => tag.name),
    ingredients: ingredients.map((ingr) => ({
      name: ingr.name,
      quantity: Number(ingr.quantity),
      unit: ingr.unit,
    })),
    instructions: instructions.map((instr) => ({ step: instr.instruction })),
    cookTips: cookTips.map((tip) => tip.tip),
  };

  return result;
}

export async function findRecipeById(id: string): Promise<Recipe> {
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.id, id));
  const images = await db
    .select()
    .from(recipeImagesTable)
    .where(eq(recipeImagesTable.recipeID, id));
  const instructions = await db
    .select()
    .from(recipeInstructionsTable)
    .where(eq(recipeInstructionsTable.recipeID, id));
  const ingredients = await db
    .select()
    .from(recipeIngredientsTable)
    .where(eq(recipeIngredientsTable.recipeID, id));
  const tags = await db
    .select()
    .from(recipeTagsTable)
    .where(eq(recipeTagsTable.recipeID, id));
  const cookTips = await db
    .select()
    .from(recipeCookTipsTable)
    .where(eq(recipeCookTipsTable.recipeID, id));
  if (
    !recipe ||
    images.length === 0 ||
    instructions.length === 0 ||
    ingredients.length === 0 ||
    tags.length === 0 ||
    cookTips.length === 0
  ) {
    console.log(
      recipe,
      images.length,
      instructions.length,
      ingredients.length,
      tags.length,
      cookTips.length
    );
    throw new Error("Error in findRecipeById function");
  }
  const result = {
    id: recipe.id,
    imageURL: images.map((img) => img.imageURL),
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prep: {
      hrs: recipe.prep_hrs,
      mins: recipe.prep_mins,
    },
    cook: {
      hrs: recipe.cook_hrs,
      mins: recipe.cook_mins,
    },
    tags: tags.map((tag) => tag.name),
    ingredients: ingredients.map((ingr) => ({
      name: ingr.name,
      quantity: Number(ingr.quantity),
      unit: ingr.unit,
    })),
    instructions: instructions.map((instr) => ({ step: instr.instruction })),
    cookTips: cookTips.map((tip) => tip.tip),
  };

  return result;
}
