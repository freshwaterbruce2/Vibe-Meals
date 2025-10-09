import React, { useState } from 'react';
import { MealPlanSettings } from '../types';

interface BudgetSetupProps {
  onGenerate: (settings: MealPlanSettings) => void;
  disabled: boolean;
}

const mealTypesOptions = ['Breakfast', 'Lunch', 'Dinner'] as const;
const storeOptions = ['Walmart', 'Kroger', 'Safeway', 'Aldi', 'Trader Joe\'s', 'Costco'];

const BudgetSetup: React.FC<BudgetSetupProps> = ({ onGenerate, disabled }) => {
  const [budget, setBudget] = useState('150');
  const [people, setPeople] = useState('2');
  const [days, setDays] = useState('7');
  const [preferences, setPreferences] = useState('');
  const [selectedMeals, setSelectedMeals] = useState<Set<typeof mealTypesOptions[number]>>(new Set(['Dinner']));
  const [wantsCrockpot, setWantsCrockpot] = useState(false);
  const [preferredStores, setPreferredStores] = useState<Set<string>>(new Set());

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

  const handleStoreChange = (store: string) => {
    setPreferredStores(prev => {
        const newSet = new Set(prev);
        if (newSet.has(store)) {
            newSet.delete(store);
        } else {
            newSet.add(store);
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
      wantsCrockpot,
      preferredStores: Array.from(preferredStores),
    });
  };

  return (
    <div style={glassCardStyle}>
      <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '2rem', color: '#4a4a4a' }}>Create Your Meal Plan</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div>
            <label htmlFor="budget" style={labelStyle}>Weekly Budget ($)</label>
            <input type="number" id="budget" value={budget} onChange={e => setBudget(e.target.value)} required min="1" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="people" style={labelStyle}>Number of People</label>
            <input type="number" id="people" value={people} onChange={e => setPeople(e.target.value)} required min="1" style={inputStyle} />
          </div>
          <div>
            <label htmlFor="days" style={labelStyle}>Number of Days</label>
            <input type="number" id="days" value={days} onChange={e => setDays(e.target.value)} required min="1" style={inputStyle} />
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Meals to Plan</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                {mealTypesOptions.map(meal => (
                    <label key={meal} style={checkboxLabelStyle(selectedMeals.has(meal))}>
                        <input type="checkbox" checked={selectedMeals.has(meal)} onChange={() => handleMealTypeChange(meal)} style={{ marginRight: '8px' }} />
                        {meal}
                    </label>
                ))}
            </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="preferences" style={labelStyle}>Dietary Preferences or Restrictions</label>
          <textarea id="preferences" value={preferences} onChange={e => setPreferences(e.target.value)} placeholder="e.g., vegetarian, gluten-free, no nuts" style={{...inputStyle, minHeight: '80px', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Preferred Grocery Stores (Optional)</label>
            <p style={{fontSize: '14px', color: '#6c757d', marginTop: '-4px', marginBottom: '12px'}}>Helps the AI find better prices and available ingredients.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                {storeOptions.map(store => (
                    <label key={store} style={checkboxLabelStyle(preferredStores.has(store))}>
                        <input type="checkbox" checked={preferredStores.has(store)} onChange={() => handleStoreChange(store)} style={{ marginRight: '8px' }} />
                        {store}
                    </label>
                ))}
            </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginTop: '32px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: '#4a4a4a' }}>
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

const glassCardStyle: React.CSSProperties = {
  padding: '40px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
  marginBottom: '40px',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(10px)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 500,
  color: '#4a4a4a'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  backgroundColor: '#fff',
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#8A2BE2', // BlueViolet
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const checkboxLabelStyle = (checked: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 12px',
    border: `1px solid ${checked ? '#8A2BE2' : '#ddd'}`,
    borderRadius: '8px',
    backgroundColor: checked ? 'rgba(138, 43, 226, 0.1)' : 'transparent',
    transition: 'all 0.2s ease',
    color: '#555',
    fontWeight: 500
});

export default BudgetSetup;