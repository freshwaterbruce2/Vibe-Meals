import React from 'react';
import { MealPlanResponse } from '../types';
import RecipeCard from './RecipeCard';

interface MealPlanDisplayProps {
  mealPlanResponse: MealPlanResponse;
  onReplaceRecipe: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  loadingState: string;
  budget: number;
  onSavePlan: () => void;
}

const BudgetProgressBar: React.FC<{ budget: number, cost: number }> = ({ budget, cost }) => {
    const percentage = Math.min((cost / budget) * 100, 100);
    const overBudget = cost > budget;
    
    let barColor = '#28a745'; // green
    if (percentage > 80) barColor = '#ffc107'; // yellow
    if (percentage > 95) barColor = '#fd7e14'; // orange
    if (overBudget) barColor = '#dc3545'; // red
    
    return (
        <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#6c757d', marginBottom: '4px' }}>
                <span>Spent: ${cost.toFixed(2)}</span>
                <span>Budget: ${budget.toFixed(2)}</span>
            </div>
            <div style={{ height: '20px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                    width: `${overBudget ? 100 : percentage}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease-in-out, background-color 0.5s ease',
                    position: 'relative'
                }}>
                   {overBudget && (
                       <div style={{ position: 'absolute', right: '0', top: '0', height: '100%', width: `${((cost - budget) / cost) * 100}%`, backgroundColor: 'rgba(0,0,0,0.2)'}}></div>
                   )}
                </div>
            </div>
             {overBudget && (
                <div style={{ color: '#dc3545', fontWeight: 500, textAlign: 'right', fontSize: '0.9rem', marginTop: '4px' }}>
                    ${(cost - budget).toFixed(2)} over budget
                </div>
            )}
        </div>
    );
};


const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlanResponse, onReplaceRecipe, loadingState, budget, onSavePlan }) => {
  const { days, total_estimated_cost } = mealPlanResponse;
  
  return (
    <div>
      <div style={glassCardStyle}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '16px'}}>
          <h2 style={{margin: 0, fontSize: '1.75rem', color: '#4a4a4a'}}>Budget Overview</h2>
          <button onClick={onSavePlan} style={saveButtonStyle}>Save Plan</button>
        </div>
        <BudgetProgressBar budget={budget} cost={total_estimated_cost} />
      </div>

      <h2 style={{fontSize: '2rem', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '30px'}}>Your Meal Plan</h2>
      {days.map(dayPlan => (
        <div key={dayPlan.day} style={{ marginBottom: '40px' }}>
          <h3 style={{ textTransform: 'capitalize', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: '8px', marginBottom: '24px', fontSize: '1.5rem', color: 'white' }}>{dayPlan.day}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {dayPlan.breakfast && <RecipeCard title="Breakfast" recipe={dayPlan.breakfast} onReplace={() => onReplaceRecipe(dayPlan.day, 'breakfast')} isReplacing={loadingState === `replacing-${dayPlan.day}-breakfast`} />}
            {dayPlan.lunch && <RecipeCard title="Lunch" recipe={dayPlan.lunch} onReplace={() => onReplaceRecipe(dayPlan.day, 'lunch')} isReplacing={loadingState === `replacing-${dayPlan.day}-lunch`} />}
            {dayPlan.dinner && <RecipeCard title="Dinner" recipe={dayPlan.dinner} onReplace={() => onReplaceRecipe(dayPlan.day, 'dinner')} isReplacing={loadingState === `replacing-${dayPlan.day}-dinner`} />}
          </div>
        </div>
      ))}
    </div>
  );
};

const glassCardStyle: React.CSSProperties = {
  padding: '24px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
  marginBottom: '30px',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(10px)',
};

const saveButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#5A67D8',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};


export default MealPlanDisplay;