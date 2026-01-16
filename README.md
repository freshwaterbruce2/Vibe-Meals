<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Vibe-Meals (AuraChef)

**AI-Powered Meal Planning with Budget Management & Smart Shopping**

[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple?logo=vite)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange)](https://ai.google.dev/)

</div>

## Overview

Vibe-Meals is an AI-powered meal planning application that revolutionizes household meal planning by combining budget management, nutritional optimization, and automated shopping list generation. Using Google's Gemini AI, it creates personalized, cost-effective meal plans tailored to your dietary preferences and budget constraints.

## Features

### Core Meal Planning
- **Personalized Meal Plans** - Generate custom meal plans based on budget, household size, dietary restrictions, and preferences
- **Flexible Configuration** - Choose number of days, people, meal types (breakfast, lunch, dinner), and preferred grocery stores
- **Special Diet Support** - Accommodate dietary restrictions, allergies, and ingredient preferences
- **Crockpot Meals** - Option to include slow-cooker friendly recipes

### Smart Recipe Management
- **Detailed Recipe Cards** - View prep time, cook time, calories, and nutritional information
- **Expandable Instructions** - Full ingredient lists and step-by-step cooking instructions
- **Recipe Replacement** - Swap individual meals while maintaining budget constraints
- **Recipe Search** - Search for recipes with ingredient include/exclude filters
- **Sortable Views** - Sort by day, cost, prep time, or cook time

### Budget & Shopping
- **Budget Tracking** - Visual progress bar showing spending against budget
- **Smart Shopping Lists** - Auto-generated, categorized shopping lists with quantity consolidation
- **Pantry Integration** - Track pantry items and auto-exclude from shopping lists
- **Bulk Actions** - Select all, deselect all, clear pantry items at once

### Price Comparison
- **Local Store Prices** - Enter zip code for AI-powered local price estimates
- **Store Comparison** - Compare prices across multiple grocery stores
- **Best Value Highlighting** - See which store offers the best overall value
- **Optimized Export** - Export shopping list organized for your best-value store

### Utility Features
- **Unit Converter** - AI-powered ingredient-aware conversions (cups to grams, etc.)
- **Pantry Recipes** - Get bonus recipe suggestions from pantry + meal plan ingredients
- **Save & Load Plans** - Persist meal plans locally for future use
- **Copy to Clipboard** - Export formatted shopping lists

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini AI (2.5 Flash)
- **Styling**: CSS-in-JS with glassmorphism design
- **Storage**: Browser localStorage for persistence

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/vibe-meals.git
   cd vibe-meals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |

## Project Structure

```
vibe-meals/
├── components/           # React components
│   ├── AboutPage.tsx         # About page with feature descriptions
│   ├── BudgetSetup.tsx       # Budget and preferences configuration
│   ├── ErrorDisplay.tsx      # Error handling component
│   ├── ExportListModal.tsx   # Export shopping list modal
│   ├── Header.tsx            # App header with navigation
│   ├── Loader.tsx            # Loading spinner component
│   ├── MealPlanDisplay.tsx   # Main meal plan view with sorting
│   ├── PantryTracker.tsx     # Pantry item management
│   ├── RecipeCard.tsx        # Individual recipe display
│   ├── RecipeSearch.tsx      # Recipe search interface
│   ├── SavedPlansModal.tsx   # Saved plans management
│   ├── ShoppingList.tsx      # Shopping list with categories
│   ├── StoreComparisonDisplay.tsx  # Price comparison view
│   └── UnitConverter.tsx     # Unit conversion utility
├── services/
│   └── geminiService.ts  # Gemini AI API integration
├── App.tsx               # Main application component
├── types.ts              # TypeScript interfaces
├── index.tsx             # React DOM entry point
└── index.html            # HTML template
```

## How It Works

1. **Configure Your Plan** - Set budget, household size, dietary preferences, and meal types
2. **Generate Meal Plan** - AI creates a personalized weekly meal plan within budget
3. **Review & Customize** - View recipes, replace meals, sort and filter as needed
4. **Generate Shopping List** - Auto-create categorized shopping list with pantry awareness
5. **Compare Prices** - Get local store price estimates and find the best value
6. **Export & Shop** - Copy optimized shopping list organized by store sections

## AI Features

Vibe-Meals uses Google Gemini AI for:
- Intelligent meal plan generation based on complex constraints
- Recipe replacement matching dietary needs and budget
- Smart shopping list consolidation and categorization
- Local price estimation using Google Search grounding
- Ingredient-aware unit conversions
- Pantry-based bonus recipe suggestions

## View in AI Studio

View the original app in AI Studio: https://ai.studio/apps/drive/1zA0azAkaiur7loPBuxKcKkF2d3K6r9PP

## License

This project is private and not licensed for redistribution.
