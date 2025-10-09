import { GoogleGenAI, Type } from "@google/genai";
import { MealPlanSettings, MealPlanResponse, ShoppingListItem, ComparisonResult, Recipe, SimpleRecipe } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ingredientSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        // FIX: Use Type.STRING for amount to allow for non-numeric values like "a pinch"
        amount: { type: Type.STRING, description: "e.g., '2' or '0.5' or 'a pinch'" },
        unit: { type: Type.STRING },
    },
    required: ["name", "amount", "unit"],
};

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        ingredients: {
            type: Type.ARRAY,
            items: ingredientSchema
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        estimated_cost: { type: Type.NUMBER },
        prep_time_minutes: { type: Type.NUMBER },
        cook_time_minutes: { type: Type.NUMBER },
        total_calories: { type: Type.NUMBER },
    },
    required: ["name", "ingredients", "instructions", "estimated_cost", "prep_time_minutes", "cook_time_minutes", "total_calories"],
};

const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.STRING },
        breakfast: recipeSchema,
        lunch: recipeSchema,
        dinner: recipeSchema,
    },
    required: ["day"],
};


const mealPlanResponseSchema = {
    type: Type.OBJECT,
    properties: {
        days: {
            type: Type.ARRAY,
            items: dayPlanSchema,
        },
        total_estimated_cost: { type: Type.NUMBER },
    },
    required: ["days", "total_estimated_cost"],
};

const generatePrompt = (settings: MealPlanSettings): string => {
    return `Create a meal plan for ${settings.people} people for ${settings.days} days.
The total budget for all meals is $${settings.budget}.
Dietary preferences and restrictions: ${settings.preferences || 'None'}.
Plan for the following meals: ${settings.mealTypes.join(', ')}.
${settings.wantsCrockpot ? 'Prioritize crockpot-friendly meals where possible, especially for dinner.' : ''}
${settings.preferredStores && settings.preferredStores.length > 0 ? `Assume ingredients are purchased from one of these stores: ${settings.preferredStores.join(', ')} when estimating costs.` : ''}
Provide a detailed response in JSON format. For each day, provide recipes for the requested meals. Each recipe must include a name, a list of ingredients with amounts and units, step-by-step instructions, an estimated cost, prep_time_minutes, cook_time_minutes, and total_calories. The sum of all recipe costs should be close to the total_estimated_cost. Calculate the total_estimated_cost for the entire plan.
Ensure the output matches the provided JSON schema. The "day" property should be the day of the week (e.g., Monday, Tuesday).
`;
};

export const generateMealPlan = async (settings: MealPlanSettings): Promise<MealPlanResponse> => {
    const prompt = generatePrompt(settings);
    
    // Create a dynamic schema based on selected meals
    const dynamicDayPlanSchema = { ...dayPlanSchema, properties: {...dayPlanSchema.properties} };
    if (!settings.mealTypes.includes('Breakfast')) delete (dynamicDayPlanSchema.properties as any).breakfast;
    if (!settings.mealTypes.includes('Lunch')) delete (dynamicDayPlanSchema.properties as any).lunch;
    if (!settings.mealTypes.includes('Dinner')) delete (dynamicDayPlanSchema.properties as any).dinner;

    const dynamicMealPlanResponseSchema = {
        ...mealPlanResponseSchema,
        properties: {
            ...mealPlanResponseSchema.properties,
            days: {
                type: Type.ARRAY,
                items: dynamicDayPlanSchema
            }
        }
    }

    // FIX: Use correct model 'gemini-2.5-flash' and API structure.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: dynamicMealPlanResponseSchema
        },
    });

    try {
        // FIX: Extract text directly from response.text property.
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MealPlanResponse;
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        console.error("Raw response:", response.text);
        throw new Error("The AI returned an invalid response. Please try again.");
    }
};

export const replaceRecipe = async (
    currentPlan: MealPlanResponse,
    settings: MealPlanSettings,
    dayToReplace: string,
    mealTypeToReplace: 'breakfast' | 'lunch' | 'dinner'
): Promise<Recipe> => {
    const prompt = `
Given the following meal plan and user settings, generate a new ${mealTypeToReplace} recipe for ${dayToReplace}.
The new recipe must adhere to the user's budget and preferences. The cost of the new recipe should be similar to the one it is replacing to keep the total budget in check.

User Settings:
- Budget: $${settings.budget} for ${settings.days} days for ${settings.people} people.
- Preferences: ${settings.preferences || 'None'}
- Crockpot meals prioritized: ${settings.wantsCrockpot}
- Preferred Stores: ${settings.preferredStores?.join(', ') || 'Any'}


Current Meal Plan (for context, do not repeat it):
${JSON.stringify(currentPlan, null, 2)}

Please provide ONLY the JSON for the new recipe for ${dayToReplace}'s ${mealTypeToReplace}.
The recipe should not be something already present in the meal plan. It must include all fields: name, ingredients, instructions, estimated_cost, prep_time_minutes, cook_time_minutes, and total_calories.
`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Recipe;
    } catch (e) {
        console.error("Failed to parse Gemini response for recipe replacement:", e);
        console.error("Raw response:", response.text);
        throw new Error("The AI returned an invalid recipe. Please try again.");
    }
};

const shoppingListSchema = {
    type: Type.OBJECT,
    properties: {
        shopping_list: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    category: { type: Type.STRING, description: "e.g., Produce, Dairy, Meat, Pantry, Spices" }
                },
                required: ["name", "amount", "unit", "category"]
            }
        }
    },
    required: ["shopping_list"]
};

export const generateShoppingList = async (mealPlan: MealPlanResponse): Promise<ShoppingListItem[]> => {
    const prompt = `
Based on the following meal plan, generate a consolidated shopping list.
Combine ingredient quantities where possible (e.g., if two recipes need onions, sum the total amount).
Categorize each item to make shopping easier. Common categories are Produce, Dairy, Meat, Pantry, Spices, Bakery, Frozen.

Meal Plan:
${JSON.stringify(mealPlan, null, 2)}

Provide the response as a JSON object with a single key "shopping_list" which is an array of items.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: shoppingListSchema
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.shopping_list as ShoppingListItem[];
    } catch (e) {
        console.error("Failed to parse Gemini response for shopping list:", e);
        console.error("Raw response:", response.text);
        throw new Error("The AI returned an invalid shopping list. Please try again.");
    }
};

export const comparePrices = async (items: string[], zipCode: string): Promise<ComparisonResult[]> => {
    // Step 1: Get the price information from the web using Google Search grounding.
    const searchPrompt = `
Find the estimated prices for the following shopping list items at three popular grocery stores near the zip code ${zipCode}.
Please provide the store name and price for each item in a clear, easy-to-read format.

Items:
- ${items.join('\n- ')}
`;

    const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: searchPrompt,
        config: {
            tools: [{googleSearch: {}}],
        }
    });

    const rawText = searchResponse.text;
    if (!rawText || rawText.trim() === '') {
        throw new Error("The AI could not find any price information. The area might not have enough data.");
    }

    // Step 2: Take the text response and structure it into JSON.
    const structuringPrompt = `
Based on the following text, extract the price comparison information and format it as a valid JSON array.
Each object in the array should represent an item and have two keys: "itemName" (string) and "prices" (an array of objects with "store" (string) and "price" (number) keys).
Ignore any introductory text or summaries. Provide only the JSON array.

Text to parse:
"""
${rawText}
"""
`;
    
    // Define the schema for the expected JSON output
    const priceSchema = {
        type: Type.OBJECT,
        properties: {
            store: { type: Type.STRING },
            price: { type: Type.NUMBER }
        },
        required: ["store", "price"]
    };
    
    const comparisonResultSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                itemName: { type: Type.STRING },
                prices: {
                    type: Type.ARRAY,
                    items: priceSchema
                }
            },
            required: ["itemName", "prices"]
        }
    };
    
    const structuredResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: structuringPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: comparisonResultSchema
        }
    });

    try {
        const jsonText = structuredResponse.text.trim();
        return JSON.parse(jsonText) as ComparisonResult[];
    } catch (e) {
        console.error("Failed to parse Gemini response for price comparison:", e);
        console.error("Raw response from structuring call:", structuredResponse.text);
        throw new Error("The AI returned invalid price data after searching. Please try again.");
    }
};

export const convertUnits = async (amount: string, fromUnit: string, toUnit: string, ingredient: string): Promise<string> => {
    const prompt = `Convert ${amount} ${fromUnit} of ${ingredient} to ${toUnit}. Provide only the resulting string, for example: "250 grams" or "approx. 1.5 cups".`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    // Directly return the text response from the model
    return response.text.trim();
};

export const generateExportableList = async (bestStoreName: string, items: {itemName: string, price: number}[]): Promise<string> => {
    const itemsText = items.map(item => `- ${item.itemName}: $${item.price.toFixed(2)}`).join('\n');
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);

    const prompt = `
You are a helpful shopping assistant. Your task is to take a list of grocery items for a specific store and format it into a highly-organized, human-friendly shopping list that someone can easily use in the store.

Store Name: ${bestStoreName}
Total Estimated Cost: $${totalCost.toFixed(2)}

Items to purchase:
${itemsText}

Please format the list with the following criteria:
1.  Group items by common grocery store categories (e.g., Produce, Dairy & Eggs, Meat & Seafood, Bakery, Pantry Staples, Frozen Foods, Beverages, Household).
2.  Within each category, list the items clearly.
3.  Start with a clear title like "Your Shopping List for [Store Name]".
4.  End with the "Total Estimated Cost".
5.  Keep the format clean and easy to read on a mobile phone. Do not use JSON or any code formatting. Use clear headings for categories.

Example format:

Your Shopping List for [Store Name]
================================

**Produce**
- [Item Name]: $[Price]
- [Item Name]: $[Price]

**Dairy & Eggs**
- [Item Name]: $[Price]

... and so on for other categories.

================================
Total Estimated Cost: $[Total Price]
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text.trim();
};

const simpleRecipeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING, description: "A brief, enticing description of the dish." },
        ingredients_used: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the key ingredients used from the provided list."
        }
    },
    required: ["name", "description", "ingredients_used"]
};

const pantryRecipesResponseSchema = {
    type: Type.OBJECT,
    properties: {
        recipes: {
            type: Type.ARRAY,
            items: simpleRecipeSchema
        }
    },
    required: ["recipes"]
};

export const generatePantryRecipes = async (pantryItems: string[], mealPlanIngredients: string[]): Promise<SimpleRecipe[]> => {
    const prompt = `
I have the following ingredients available:
- Pantry Staples: ${pantryItems.join(', ')}
- Other ingredients from my meal plan: ${mealPlanIngredients.join(', ')}

Based ONLY on this list of available ingredients, suggest 2-3 simple and creative recipes (like snacks, side dishes, or simple meals) that I could make to use up what I have.
For each recipe, provide a name, a short description, and list the key ingredients used from the list I provided.
Do not suggest recipes that require ingredients not on my list.

Provide the response as a JSON object with a single key "recipes" which is an array of recipe objects.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: pantryRecipesResponseSchema
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.recipes as SimpleRecipe[];
    } catch (e) {
        console.error("Failed to parse Gemini response for pantry recipes:", e);
        console.error("Raw response:", response.text);
        throw new Error("The AI returned invalid recipe suggestions. Please try again.");
    }
};
