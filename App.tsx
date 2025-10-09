import React, { useState, useEffect } from 'react';
import BudgetSetup from './components/BudgetSetup';
import Header from './components/Header';
import MealPlanDisplay from './components/MealPlanDisplay';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import ShoppingList from './components/ShoppingList';
import PantryTracker from './components/PantryTracker';
import SavedPlansModal from './components/SavedPlansModal';
import RecipeSearch from './components/RecipeSearch';
import AboutPage from './components/AboutPage';
import { MealPlanSettings, MealPlanResponse, Recipe } from './types';
import { generateMealPlan, replaceRecipe as apiReplaceRecipe, searchRecipes as apiSearchRecipes } from './services/geminiService';

interface SavedPlan {
    name: string;
    id: number;
    settings: MealPlanSettings;
    mealPlan: MealPlanResponse;
}

const App: React.FC = () => {
    const [settings, setSettings] = useState<MealPlanSettings | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
    const [loadingState, setLoadingState] = useState<string>('idle'); // idle, generating, replacing-DAY-MEAL, error
    const [error, setError] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
    const [isPlansModalVisible, setIsPlansModalVisible] = useState(false);
    const [pantryItems, setPantryItems] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<Recipe[] | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'main' | 'about'>('main');

    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem('mealVibePlans');
            if (storedPlans) {
                setSavedPlans(JSON.parse(storedPlans));
            }
            const storedPantry = localStorage.getItem('mealVibePantry');
            if (storedPantry) {
                setPantryItems(JSON.parse(storedPantry));
            } else {
                // Set some defaults for first-time users
                setPantryItems(['Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Onion']);
            }
        } catch (error) {
            console.error("Failed to load from local storage:", error);
            setSavedPlans([]);
            setPantryItems(['Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Onion']);
        }
    }, []);

    const handlePantryUpdate = (newItems: string[]) => {
        setPantryItems(newItems);
        localStorage.setItem('mealVibePantry', JSON.stringify(newItems));
    };

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
            setIsFormVisible(true);
        }
    };

    const handleSavePlan = () => {
        if (!mealPlan || !settings) return;
        const planName = prompt("Enter a name for this meal plan:", `Plan for ${settings.days} days`);
        if (planName) {
            const newPlan: SavedPlan = {
                name: planName,
                id: Date.now(),
                settings,
                mealPlan,
            };
            const updatedPlans = [...savedPlans, newPlan];
            setSavedPlans(updatedPlans);
            localStorage.setItem('mealVibePlans', JSON.stringify(updatedPlans));
            alert(`Plan "${planName}" saved successfully!`);
        }
    };

    const handleLoadPlan = (planToLoad: SavedPlan) => {
        setSettings(planToLoad.settings);
        setMealPlan(planToLoad.mealPlan);
        setIsPlansModalVisible(false);
        setIsFormVisible(false);
        setCurrentView('main');
    };

    const handleDeletePlan = (planId: number) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            const updatedPlans = savedPlans.filter(p => p.id !== planId);
            setSavedPlans(updatedPlans);
            localStorage.setItem('mealVibePlans', JSON.stringify(updatedPlans));
        }
    };

    const handleRecipeSearch = async (query: string, includeIngredients: string[], excludeIngredients: string[]) => {
        setIsSearching(true);
        setSearchError(null);
        setSearchResults(null);
        try {
            const results = await apiSearchRecipes(query, includeIngredients, excludeIngredients);
            setSearchResults(results);
        } catch (err: any) {
            setSearchError(err.message || 'An unknown error occurred while searching.');
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleGoHome = () => {
        setCurrentView('main');
        // Reset state when going home, but keep saved plans and pantry
        setMealPlan(null);
        setSettings(null);
        setError(null);
        setIsFormVisible(false);
        setLoadingState('idle');
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
            <Header 
                onShowPlans={() => setIsPlansModalVisible(true)} 
                hasPlans={savedPlans.length > 0}
                onShowAbout={() => setCurrentView('about')}
                onGoHome={handleGoHome}
            />

            {currentView === 'about' && <AboutPage onBack={() => setCurrentView('main')} />}
            
            {currentView === 'main' && (
                <>
                    {!isFormVisible && !mealPlan && loadingState !== 'generating' && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'white' }}>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', marginBottom: '20px' }}>
                                Effortless meal planning,
                                <br />
                                tailored to you.
                            </h1>
                            <p style={{ fontSize: '1.25rem', marginBottom: '40px', opacity: 0.9 }}>
                                Save time, eat well, and stay on budget with your personal AI chef.
                            </p>
                            <button onClick={() => setIsFormVisible(true)} style={heroButtonStyle}>
                                Start Planning
                            </button>
                        </div>
                    )}

                    {isFormVisible && !mealPlan && loadingState !== 'generating' && (
                        <BudgetSetup onGenerate={handleGenerateMealPlan} disabled={loadingState === 'generating'} />
                    )}

                    {loadingState === 'generating' && <Loader message="Crafting your personalized meal plan..." />}
                    {error && loadingState === 'error' && <ErrorDisplay error={error} onRetry={handleRetry} />}
                    
                    {mealPlan && settings && (
                         <div style={{marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px'}}>
                            <MealPlanDisplay 
                                mealPlanResponse={mealPlan} 
                                onReplaceRecipe={handleReplaceRecipe}
                                loadingState={loadingState}
                                budget={settings.budget}
                                onSavePlan={handleSavePlan}
                            />
                            <ShoppingList mealPlan={mealPlan} pantryItems={pantryItems} />
                            <PantryTracker 
                                pantryItems={pantryItems} 
                                onUpdatePantry={handlePantryUpdate} 
                                mealPlan={mealPlan}
                            />
                        </div>
                    )}

                    <RecipeSearch 
                        onSearch={handleRecipeSearch}
                        searchResults={searchResults}
                        isSearching={isSearching}
                        searchError={searchError}
                    />
                </>
            )}
            
            {isPlansModalVisible && (
                <SavedPlansModal 
                    savedPlans={savedPlans}
                    onLoad={handleLoadPlan}
                    onDelete={handleDeletePlan}
                    onClose={() => setIsPlansModalVisible(false)}
                />
            )}
        </div>
    );
};

const heroButtonStyle: React.CSSProperties = {
  padding: '15px 35px',
  border: 'none',
  borderRadius: '50px',
  backgroundColor: '#ffffff',
  color: '#6a11cb',
  fontSize: '18px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  transform: 'translateY(0)',
};


export default App;