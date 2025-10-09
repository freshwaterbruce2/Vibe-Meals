import React, { useState, useMemo } from 'react';
import { MealPlanResponse, ShoppingListItem, ComparisonResult } from '../types';
import { generateShoppingList, comparePrices } from '../services/geminiService';
import Loader from './Loader';
import StoreComparisonDisplay from './StoreComparisonDisplay';
import UnitConverter from './UnitConverter';

interface ShoppingListProps {
  mealPlan: MealPlanResponse;
  pantryItems: string[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ mealPlan, pantryItems }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[] | null>(null);
  const [isConverterVisible, setIsConverterVisible] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setComparisonResults(null);
    try {
      const list = await generateShoppingList(mealPlan);
      // Automatically check off items that are already in the user's pantry.
      const listWithPantryCheck = list.map(item => {
          // A simple check: if any pantry item is a substring of the shopping list item name,
          // or vice-versa, consider it a match. This handles cases like "onion" vs "yellow onion".
          const inPantry = pantryItems.some(pantryItem => 
              item.name.toLowerCase().includes(pantryItem.toLowerCase()) || 
              pantryItem.toLowerCase().includes(item.name.toLowerCase())
          );
          // `checked: true` means we have it, so we don't need to buy it.
          // The checkbox input is `!item.checked`, so this will make the checkbox appear unchecked.
          return { ...item, checked: inPantry };
      });
      setShoppingList(listWithPantryCheck);
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

  const handleToggleCategory = (category: string, check: boolean) => {
    setShoppingList(prevList =>
        prevList.map(item =>
            item.category === category ? { ...item, checked: check } : item
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

  // FIX: The type of `items` was inferred as `unknown` because `useMemo` for `categorizedList` could return a plain `{}`, causing `Object.entries` to produce a weakly-typed array. By removing the redundant `if (shoppingList.length === 0)` check, `reduce` correctly handles an empty array and maintains the `Record<string, ShoppingListItem[]>` type, resolving the `items.map` error.
  const categorizedList = useMemo(() => {
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
    <>
    <div style={glassCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.75rem', color: '#4a4a4a' }}>Shopping List</h2>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <button onClick={() => setIsConverterVisible(true)} style={secondaryButtonStyle}>Unit Converter</button>
            {shoppingList.length === 0 && (
              <button onClick={handleGenerate} disabled={isGenerating} style={{ ...buttonStyle, minWidth: '200px' }}>
                {isGenerating ? 'Generating...' : 'Generate Shopping List'}
              </button>
            )}
        </div>
      </div>

      {isGenerating && <Loader message="Compiling your shopping list..." />}
      {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}
      
      {Object.keys(categorizedList).length > 0 && (
        <>
        <p style={{color: '#6c757d', marginTop: 0}}>Here's your consolidated shopping list. Items in your pantry have been unchecked automatically.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* FIX: Use non-destructured arguments in sort to prevent type inference issues. */}
          {Object.entries(categorizedList).sort((a, b) => a[0].localeCompare(b[0])).map(([category, items]) => (
            <div key={category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '12px' }}>
                  <h4 style={{ textTransform: 'capitalize', margin: 0, color: '#555' }}>{category}</h4>
                  <div style={{display: 'flex', gap: '8px'}}>
                      <button onClick={() => handleToggleCategory(category, false)} style={categoryButtonStyle} title={`Deselect all in ${category}`}>None</button>
                      <button onClick={() => handleToggleCategory(category, true)} style={categoryButtonStyle} title={`Select all in ${category}`}>All</button>
                  </div>
              </div>
              {items.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!item.checked}
                    onChange={() => handleToggleItem(item.name)}
                    id={`item-${item.name}`}
                    style={{ marginRight: '10px', width: '18px', height: '18px' }}
                  />
                  <label htmlFor={`item-${item.name}`} style={{ textDecoration: !item.checked ? 'none' : 'line-through', color: !item.checked ? 'inherit' : '#6c757d', cursor: 'pointer' }}>
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
    {isConverterVisible && <UnitConverter onClose={() => setIsConverterVisible(false)} />}
    </>
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
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#8A2BE2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#6c757d',
};

const categoryButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#555',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
};


export default ShoppingList;
