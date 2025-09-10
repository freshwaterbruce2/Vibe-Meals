// types.ts

export interface MealPlanSettings {
  budget: number;
  people: number;
  days: number;
  preferences: string;
  mealTypes: string[];
  wantsCrockpot: boolean;
}

export interface Ingredient {
  name: string;
  amount: number | string;
  unit: string;
}

export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  estimated_cost: number;
}

export interface DayPlan {
  day: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
}

export interface MealPlanResponse {
  days: DayPlan[];
  total_estimated_cost: number;
}

export interface ShoppingListItem {
    name: string;
    amount: number | string;
    unit: string;
    category: string;
    checked?: boolean;
}

export interface ComparisonPrice {
    store: string;
    price: number;
}

export interface ComparisonResult {
    itemName: string;
    prices: ComparisonPrice[];
}
