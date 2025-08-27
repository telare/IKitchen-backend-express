export type Recipe = {
  id: string;
  imageURL: string[];
  title: string;
  description: string;
  servings: number;
  prep: {
    hrs: number;
    mins: number;
  };
  cook: {
    hrs: number;
    mins: number;
  };
  tags: string[];
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: {
    step: string;
  }[];
  cookTips: string[];
};
export type InputRecipe = Omit<Recipe, "id">;
