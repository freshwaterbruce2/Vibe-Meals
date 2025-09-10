import React from 'react';
import { MealPlanResponse } from '../types';
import RecipeCard from './RecipeCard';

interface MealPlanDisplayProps {
  mealPlanResponse: MealPlanResponse;
  onReplaceRecipe: (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  loadingState: string;
  budget: number;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlanResponse, onReplaceRecipe, loadingState, budget }) => {
  const { days, total_estimated_cost } = mealPlanResponse;
  
  const costDifference = budget - total_estimated_cost;

  return (
    <div>
      <div style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '12px', padding: '24px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{marginTop: 0, marginBottom: '16px', fontSize: '1.75rem'}}>Budget Overview</h2>
        <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
            <div>
                <div style={{fontSize: '0.9rem', color: '#6c757d', marginBottom: '4px'}}>YOUR BUDGET</div>
                <div style={{fontSize: '1.5rem', fontWeight: 600, color: '#212529'}}>${budget.toFixed(2)}</div>
            </div>
            <div>
                <div style={{fontSize: '0.9rem', color: '#6c757d', marginBottom: '4px'}}>ESTIMATED COST</div>
                <div style={{fontSize: '1.5rem', fontWeight: 600, color: '#212529'}}>${total_estimated_cost.toFixed(2)}</div>
            </div>
            <div>
                <div style={{fontSize: '0.9rem', color: '#6c757d', marginBottom: '4px'}}>REMAINING</div>
                <div style={{fontSize: '1.5rem', fontWeight: 600, color: costDifference >= 0 ? '#198754' : '#dc3545'}}>
                    ${costDifference.toFixed(2)}
                </div>
            </div>
        </div>
      </div>

      <h2 style={{fontSize: '1.75rem'}}>Your Meal Plan</h2>
      {days.map(dayPlan => (
        <div key={dayPlan.day} style={{ marginBottom: '40px' }}>
          <h3 style={{ textTransform: 'capitalize', borderBottom: '2px solid #0d6efd', paddingBottom: '8px', marginBottom: '24px', fontSize: '1.5rem' }}>{dayPlan.day}</h3>
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

export default MealPlanDisplay;
