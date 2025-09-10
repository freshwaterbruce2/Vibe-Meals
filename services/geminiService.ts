import { GoogleGenAI, Type } from "@google/genai";
import { MealPlanSettings, MealPlanResponse, ShoppingListItem, ComparisonResult, Recipe } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ingredientSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        // FIX: Use Type.STRING for amount to allow for non-numeric values like "a pinch"
        amount: { type: Type.STRING, description: "e.g. '2' or '0.5' or 'a pinch'" },
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
    },
    required: ["name", "ingredients", "instructions", "estimated_cost"],
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
Provide a detailed response in JSON format. For each day, provide recipes for the requested meals. Each recipe should include a name, a list of ingredients with amounts and units, step-by-step instructions, and an estimated cost for the ingredients for that specific recipe. The sum of all recipe costs should be close to the total_estimated_cost. Calculate the total_estimated_cost for the entire plan.
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

Current Meal Plan (for context, do not repeat it):
${JSON.stringify(currentPlan, null, 2)}

Please provide ONLY the JSON for the new recipe for ${dayToReplace}'s ${mealTypeToReplace}.
The recipe should not be something already present in the meal plan.
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
    const prompt = `
For the following shopping list items, find the estimated prices at three major grocery stores (like Walmart, Kroger, Safeway, or others) near the zip code ${zipCode}.
If a specific store is not available, choose another popular one.
Return the data in a structured format. Do not include any commentary.

Items:
- ${items.join('\n- ')}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        }
    });

    const followUpPrompt = `
Here is some information from Google Search. Based on this, please provide a price comparison for the items: ${items.join(', ')}.
Search results:
${response.text}

Please format your response as a JSON array of objects, where each object represents an item and has two keys: "itemName" (string) and "prices" (an array of objects with "store" and "price" keys).
Example format:
[
  {
    "itemName": "Chicken Breast",
    "prices": [
      { "store": "Walmart", "price": 8.99 },
      { "store": "Kroger", "price": 9.49 }
    ]
  }
]
`;

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
        contents: followUpPrompt,
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
        console.error("Raw response:", structuredResponse.text);
        throw new Error("The AI returned invalid price data. Please try again.");
    }
};
