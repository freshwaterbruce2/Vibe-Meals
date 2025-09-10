# AuraChef Meal Planner Features

This document outlines the key features of the AuraChef AI Meal Planner application.

## Core Features

### 1. Personalized Meal Plan Generation
- **Customizable Inputs:** Users can define their meal plan based on:
  - Weekly Budget
  - Number of People
  - Number of Days
- **Meal Selection:** Choose to plan for Breakfast, Lunch, and/or Dinner.
- **Dietary Preferences:** Accommodates any dietary restrictions or preferences (e.g., vegetarian, gluten-free, no nuts).
- **Crockpot Option:** Prioritize simple, all-in-one crockpot meals.
- **AI-Powered:** Utilizes the Gemini API to craft a complete, creative, and budget-conscious meal plan.

### 2. Interactive Meal Plan Display
- **Daily Breakdown:** View the meal plan organized by day of the week.
- **Detailed Recipe Cards:** Each meal is presented on a card showing:
  - Recipe Name
  - Estimated Cost
  - A collapsible section with detailed ingredients and step-by-step instructions.
- **Recipe Replacement:** Don't like a suggestion? Replace any individual recipe with a single click. The AI will generate a new, suitable alternative while keeping the budget in mind.

### 3. Budget Management
- **Budget Overview:** A clear summary displays your set budget, the plan's total estimated cost, and the remaining funds.
- **Cost-Aware Generation:** The AI actively works to stay within the user-defined budget.
- **Dynamic Cost Updates:** The total estimated cost is automatically recalculated when a recipe is replaced.

## Shopping & Pantry Tools

### 4. Smart Shopping List
- **Automatic Generation:** Creates a consolidated shopping list from all the recipes in your meal plan.
- **Ingredient Consolidation:** Intelligently combines quantities of the same ingredient from different recipes.
- **Categorization:** Items are automatically sorted into categories (Produce, Dairy, Meat, Pantry, etc.) to streamline your shopping trip.
- **Interactive Checklist:** Check off items you already have at home to customize your list.

### 5. Local Price Comparison
- **Find the Best Deals:** Enter your zip code to compare the prices of your required shopping list items at major local grocery stores.
- **Powered by Google Search:** Uses real-time search data to provide up-to-date price estimates.
- **Clear Comparison Table:** Displays prices side-by-side for each item and calculates the total cost per store.
- **Best Value Highlight:** Automatically identifies and highlights the store offering the lowest total price.

### 6. Pantry Tracker
- **Virtual Pantry:** Keep a running list of items you have on hand (e.g., salt, pepper, olive oil).
- **Easy Management:** Quickly add new items or remove ones you've used up.
- **Future-Ready:** This feature lays the groundwork for future enhancements, such as automatically removing pantry items from your shopping list.

## User Experience
- **Modern & Clean UI:** A responsive and intuitive interface for seamless meal planning.
- **Informative Loaders:** Clear loading states let you know when the AI is working its magic.
- **Graceful Error Handling:** If something goes wrong, a user-friendly error message is displayed with an option to retry.
