import React, { useState } from 'react';
import BudgetSetup from './components/BudgetSetup';
import Header from './components/Header';
import MealPlanDisplay from './components/MealPlanDisplay';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import ShoppingList from './components/ShoppingList';
import PantryTracker from './components/PantryTracker';
import { MealPlanSettings, MealPlanResponse } from './types';
import { generateMealPlan, replaceRecipe as apiReplaceRecipe } from './services/geminiService';

const App: React.FC = () => {
    const [settings, setSettings] = useState<MealPlanSettings | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
    const [loadingState, setLoadingState] = useState<string>('idle'); // idle, generating, replacing-DAY-MEAL, error
    const [error, setError] = useState<string | null>(null);

    const handleGenerateMealPlan = async (newSettings: MealPlanSettings) => {
        setLoadingState('generating');
        setError(null);
        setMealPlan(null);
        setSettings(newSettings);
        try {
            const plan = await generateMealPlan(newSettings);
            setMealPlan(plan);
            setLoadingState('idle');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setLoadingState('error');
        }
    };

    const handleReplaceRecipe = async (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
        if (!mealPlan || !settings) return;

        const replacementKey = `replacing-${day}-${mealType}`;
        setLoadingState(replacementKey);
        setError(null);
        
        try {
            const newRecipe = await apiReplaceRecipe(mealPlan, settings, day, mealType);
            
            setMealPlan(prevPlan => {
                if (!prevPlan) return null;
                
                let oldCost = 0;
                const newDays = prevPlan.days.map(dayPlan => {
                    if (dayPlan.day === day) {
                        const dayRecipe = dayPlan[mealType];
                        if (dayRecipe) {
                           oldCost = dayRecipe.estimated_cost;
                        }
                        return { ...dayPlan, [mealType]: newRecipe };
                    }
                    return dayPlan;
                });

                const newTotalCost = prevPlan.total_estimated_cost - oldCost + newRecipe.estimated_cost;

                return {
                    days: newDays,
                    total_estimated_cost: newTotalCost,
                };
            });

        } catch (err: any) {
            setError(`Failed to replace recipe: ${err.message}`);
        } finally {
            setLoadingState('idle');
        }
    };

    const handleRetry = () => {
        setError(null);
        if (settings) {
            handleGenerateMealPlan(settings);
        } else {
            setLoadingState('idle');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8f9fa' }}>
            <Header />
            <BudgetSetup onGenerate={handleGenerateMealPlan} disabled={loadingState === 'generating'} />

            {loadingState === 'generating' && <Loader message="Crafting your personalized meal plan..." />}
            {error && loadingState === 'error' && <ErrorDisplay error={error} onRetry={handleRetry} />}
            
            {mealPlan && settings && (
                 <div style={{marginTop: '40px'}}>
                    <MealPlanDisplay 
                        mealPlanResponse={mealPlan} 
                        onReplaceRecipe={handleReplaceRecipe}
                        loadingState={loadingState}
                        budget={settings.budget}
                    />
                    <ShoppingList mealPlan={mealPlan} />
                    <PantryTracker />
                </div>
            )}
        </div>
    );
};

export default App;
