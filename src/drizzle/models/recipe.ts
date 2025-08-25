import { Recipe } from "@shared/types/recipe";
import { db } from "../index";
import {
  recipeCookTipsTable,
  recipeImagesTable,
  recipeIngredients,
  recipeInstructions,
  recipesTable,
  recipeTags,
} from "@drizzle/schemas/recipes";
//If imageURL has a constraint like CHECK (imageURL ~ '^https?://')
export async function insertRecipe(
  recipe: Recipe,
  userID: string
): Promise<string | undefined> {
  try {
    const formattedRecipe = {
      ...recipe,
      author_id: userID,

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
      recipe_id: recipeID,
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
      recipe_id: recipeID,
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
      recipe_id: recipeID,
      step: index + 1,
      instruction: instruction.step,
    }));
    const settedInstructions = await db
      .insert(recipeInstructions)
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
      recipe_id: recipeID,
      unit: ing.unit,
    }));

    const settedIngredients = await db
      .insert(recipeIngredients)
      .values(ingredients)
      .returning();

    if (settedIngredients.length !== ingredients.length) {
      throw new Error(`Recipe's tags insert failed. Recipe id: ${recipeID}`);
    }

    // TAGS
    const tags = recipe.tags.map((tag) => ({
      name: tag,
      recipe_id: recipeID,
    }));
    const settedTags = await db.insert(recipeTags).values(tags).returning();
    if (settedTags.length !== tags.length) {
      throw new Error(`Recipe's tags insert failed. Recipe id: ${recipeID}`);
    }

    return recipeID;
  } catch (err: unknown) {
    throw err;
  }
}
