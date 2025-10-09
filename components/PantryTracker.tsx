import React, { useState, useMemo } from 'react';
import { MealPlanResponse, SimpleRecipe } from '../types';
import { generatePantryRecipes } from '../services/geminiService';
import Loader from './Loader';

interface PantryTrackerProps {
    pantryItems: string[];
    onUpdatePantry: (items: string[]) => void;
    mealPlan: MealPlanResponse | null;
}

const PantryTracker: React.FC<PantryTrackerProps> = ({ pantryItems, onUpdatePantry, mealPlan }) => {
    const [newItem, setNewItem] = useState('');
    const [suggestedRecipes, setSuggestedRecipes] = useState<SimpleRecipe[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem && !pantryItems.includes(newItem)) {
            onUpdatePantry([...pantryItems, newItem].sort());
            setNewItem('');
        }
    };
    
    const handleRemoveItem = (itemToRemove: string) => {
        onUpdatePantry(pantryItems.filter(item => item !== itemToRemove));
    };

    const allMealPlanIngredients = useMemo(() => {
        if (!mealPlan) return [];
        const ingredients = new Set<string>();
        mealPlan.days.forEach(day => {
            if (day.breakfast) day.breakfast.ingredients.forEach(ing => ingredients.add(ing.name));
            if (day.lunch) day.lunch.ingredients.forEach(ing => ingredients.add(ing.name));
            if (day.dinner) day.dinner.ingredients.forEach(ing => ingredients.add(ing.name));
        });
        return Array.from(ingredients);
    }, [mealPlan]);

    const handleSuggestRecipes = async () => {
        setIsSuggesting(true);
        setSuggestionError(null);
        setSuggestedRecipes([]);
        try {
            const recipes = await generatePantryRecipes(pantryItems, allMealPlanIngredients);
            setSuggestedRecipes(recipes);
        } catch (err: any) {
            setSuggestionError(err.message || 'Could not get suggestions.');
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <div style={glassCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.75rem', color: '#4a4a4a' }}>Pantry Tracker</h2>
            <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '20px' }}>
                Keep track of items you have on hand. The shopping list will automatically uncheck items found in your pantry.
            </p>
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Add an item to your pantry"
                    style={{ flexGrow: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px' }}
                />
                <button type="submit" style={buttonStyle}>Add Item</button>
            </form>
            <div>
                {pantryItems.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {pantryItems.map(item => (
                            <li key={item} style={{ backgroundColor: '#e9ecef', padding: '8px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4a4a4a' }}>
                                {item}
                                <button onClick={() => handleRemoveItem(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6c757d', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>&times;</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#6c757d' }}>Your pantry is empty. Add some items you commonly have!</p>
                )}
            </div>

            {mealPlan && (
                <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '30px' }}>
                    <h3 style={{marginTop: 0, fontSize: '1.5rem', color: '#4a4a4a'}}>Bonus Recipe Ideas</h3>
                    <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '20px' }}>
                        Find simple recipes using your pantry items and ingredients from your meal plan.
                    </p>
                    <button onClick={handleSuggestRecipes} disabled={isSuggesting} style={{ ...suggestionButtonStyle }}>
                        {isSuggesting ? 'Thinking...' : 'Get Recipe Ideas'}
                    </button>

                    {isSuggesting && <Loader message="Analyzing your ingredients..." />}
                    {suggestionError && <p style={{ color: '#dc3545', marginTop: '1rem' }}>Error: {suggestionError}</p>}
                    
                    {suggestedRecipes.length > 0 && (
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {suggestedRecipes.map((recipe, index) => (
                                <div key={index} style={recipeSuggestionCardStyle}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#5A67D8' }}>{recipe.name}</h4>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#4a4a4a' }}>{recipe.description}</p>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                        <strong style={{color: '#555'}}>Key Ingredients:</strong> {recipe.ingredients_used.join(', ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const glassCardStyle: React.CSSProperties = {
  padding: '24px 40px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(10px)',
};


const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#28a745',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const suggestionButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#5A67D8', // Indigo
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
};

const recipeSuggestionCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    padding: '16px',
};


export default PantryTracker;
