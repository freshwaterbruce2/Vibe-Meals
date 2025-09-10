import React, { useState, useMemo } from 'react';
import { MealPlanResponse, ShoppingListItem, ComparisonResult } from '../types';
import { generateShoppingList, comparePrices } from '../services/geminiService';
import Loader from './Loader';
import StoreComparisonDisplay from './StoreComparisonDisplay';

interface ShoppingListProps {
  mealPlan: MealPlanResponse;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ mealPlan }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[] | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setComparisonResults(null);
    try {
      const list = await generateShoppingList(mealPlan);
      setShoppingList(list.map(item => ({ ...item, checked: false })));
    } catch (err: any) {
      setError(err.message || 'Failed to generate shopping list.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = (itemName: string) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.name === itemName ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const handleComparePrices = async (zipCode: string) => {
    setIsComparing(true);
    setError(null);
    try {
        const itemsToCompare = shoppingList.filter(item => !item.checked).map(item => `${item.amount} ${item.unit} ${item.name}`);
        if(itemsToCompare.length > 0) {
            const results = await comparePrices(itemsToCompare, zipCode);
            setComparisonResults(results);
        }
    } catch (err: any) {
        setError(err.message || 'Failed to compare prices.');
    } finally {
        setIsComparing(false);
    }
  };

  const categorizedList = useMemo(() => {
    if (shoppingList.length === 0) return {};
    return shoppingList.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);
  }, [shoppingList]);
  
  const selectedItemCount = shoppingList.filter(item => !item.checked).length;

  return (
    <div style={{ marginTop: '40px', border: '1px solid #dee2e6', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.75rem', marginBottom: '20px' }}>Shopping List</h2>
        {shoppingList.length === 0 && (
          <button onClick={handleGenerate} disabled={isGenerating} style={{ ...buttonStyle, minWidth: '200px' }}>
            {isGenerating ? 'Generating...' : 'Generate Shopping List'}
          </button>
        )}
      </div>

      {isGenerating && <Loader message="Compiling your shopping list..." />}
      {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}
      
      {Object.keys(categorizedList).length > 0 && (
        <>
        <p style={{color: '#6c757d', marginTop: 0}}>Here's your consolidated shopping list. Uncheck items you already have at home before comparing prices.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {Object.entries(categorizedList).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
            <div key={category}>
              <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid #e9ecef', paddingBottom: '8px', marginBottom: '12px' }}>{category}</h4>
              {items.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!item.checked}
                    onChange={() => handleToggleItem(item.name)}
                    id={`item-${item.name}`}
                    style={{ marginRight: '10px', width: '18px', height: '18px' }}
                  />
                  <label htmlFor={`item-${item.name}`} style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#6c757d' : 'inherit', cursor: 'pointer' }}>
                    {item.amount} {item.unit} {item.name}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
        <StoreComparisonDisplay results={comparisonResults} onCompare={handleComparePrices} isComparing={isComparing} selectedItemCount={selectedItemCount} />
        </>
      )}
    </div>
  );
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
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
};


export default ShoppingList;
