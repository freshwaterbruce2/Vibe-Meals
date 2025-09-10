import React, { useState } from 'react';
import { MealPlanSettings } from '../types';

interface BudgetSetupProps {
  onGenerate: (settings: MealPlanSettings) => void;
  disabled: boolean;
}

const mealTypesOptions = ['Breakfast', 'Lunch', 'Dinner'] as const;

const BudgetSetup: React.FC<BudgetSetupProps> = ({ onGenerate, disabled }) => {
  const [budget, setBudget] = useState('150');
  const [people, setPeople] = useState('2');
  const [days, setDays] = useState('7');
  const [preferences, setPreferences] = useState('');
  const [selectedMeals, setSelectedMeals] = useState<Set<typeof mealTypesOptions[number]>>(new Set(['Dinner']));
  const [wantsCrockpot, setWantsCrockpot] = useState(false);

  const handleMealTypeChange = (mealType: typeof mealTypesOptions[number]) => {
    setSelectedMeals(prev => {
        const newSet = new Set(prev);
        if (newSet.has(mealType)) {
            if (newSet.size > 1) newSet.delete(mealType); // Prevent unchecking the last item
        } else {
            newSet.add(mealType);
        }
        return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeals.size === 0) {
        alert("Please select at least one meal type to plan.");
        return;
    }
    onGenerate({
      budget: Number(budget),
      people: Number(people),
      days: Number(days),
      preferences,
      mealTypes: Array.from(selectedMeals),
      wantsCrockpot
    });
  };

  return (
    <div style={{ padding: '24px 32px', border: '1px solid #dee2e6', borderRadius: '12px', marginBottom: '40px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label htmlFor="budget" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#495057' }}>Weekly Budget ($)</label>
            <input type="number" id="budget" value={budget} onChange={e => setBudget(e.target.value)} required min="1" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="people" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#495057' }}>Number of People</label>
            <input type="number" id="people" value={people} onChange={e => setPeople(e.target.value)} required min="1" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="days" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#495057' }}>Number of Days</label>
            <input type="number" id="days" value={days} onChange={e => setDays(e.target.value)} required min="1" style={inputStyle} />
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500, color: '#495057' }}>Meals to Plan</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {mealTypesOptions.map(meal => (
                    <label key={meal} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 12px', border: `1px solid ${selectedMeals.has(meal) ? '#0d6efd' : '#ced4da'}`, borderRadius: '6px', backgroundColor: selectedMeals.has(meal) ? '#e7f1ff' : 'transparent', transition: 'all 0.2s ease' }}>
                        <input type="checkbox" checked={selectedMeals.has(meal)} onChange={() => handleMealTypeChange(meal)} style={{ marginRight: '8px' }} />
                        {meal}
                    </label>
                ))}
            </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="preferences" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#495057' }}>Dietary Preferences or Restrictions</label>
          <textarea id="preferences" value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="e.g., vegetarian, gluten-free, no nuts" style={{...inputStyle, minHeight: '80px', resize: 'vertical' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: '#495057' }}>
            <input type="checkbox" checked={wantsCrockpot} onChange={(e) => setWantsCrockpot(e.target.checked)} style={{ marginRight: '8px', width: '16px', height: '16px' }} />
            Prioritize All-in-One Crockpot Meals
          </label>
          <button type="submit" disabled={disabled} style={{ ...buttonStyle, opacity: disabled ? 0.6 : 1, minWidth: '200px' }}>
            {disabled ? 'Working...' : 'Generate Meal Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #ced4da',
  fontSize: '16px',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#0d6efd',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

export default BudgetSetup;
