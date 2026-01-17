import React, { useState, useMemo } from 'react';
import { MealPlanResponse, ShoppingListItem, ComparisonResult } from '../types';
import { generateShoppingList, comparePrices } from '../services/geminiService';
import Loader from './Loader';
import StoreComparisonDisplay from './StoreComparisonDisplay';
import UnitConverter from './UnitConverter';
import ConfirmDialog from './ConfirmDialog';

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
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate shopping list.';
      setError(errorMessage);
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
  
  const handleToggleAll = (check: boolean) => {
      setShoppingList(prevList => prevList.map(item => ({ ...item, checked: check })));
  };
  
  const handleClearPantryItems = () => {
      setIsClearDialogOpen(true);
  };

  const handleClearPantryItemsConfirm = () => {
      setShoppingList(prevList => prevList.filter(item => !item.checked));
      setIsClearDialogOpen(false);
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
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to compare prices.';
        setError(errorMessage);
    } finally {
        setIsComparing(false);
    }
  };

  const categorizedList = useMemo(() => {
    // FIX: Replaced reduce with a for...of loop for more reliable type inference.
    // The previous implementation with reduce could lead to `items` being inferred as `unknown`.
    const grouped: Record<string, ShoppingListItem[]> = {};
    for (const item of shoppingList) {
        const category = item.category || 'Uncategorized';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(item);
    }
    return grouped;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
            <p style={{color: '#6c757d', margin: 0, flexBasis: '100%', maxWidth: 'calc(100% - 350px)'}}>Items in your pantry are de-selected (unchecked with a line-through).</p>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                <button onClick={() => handleToggleAll(false)} style={globalActionButtonStyle} title="Select all items to buy">Select All</button>
                <button onClick={() => handleToggleAll(true)} style={globalActionButtonStyle} title="Deselect all items">Deselect All</button>
                <button onClick={handleClearPantryItems} style={{...globalActionButtonStyle, backgroundColor: '#c82333'}} title="Remove items already in your pantry from the list">Clear Pantry Items</button>
            </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {Object.entries(categorizedList).sort((a, b) => a[0].localeCompare(b[0])).map(([category, items]) => (
            <div key={category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px', marginBottom: '12px' }}>
                  <h4 style={{ textTransform: 'capitalize', margin: 0, color: '#555' }}>{category}</h4>
                  <div style={{display: 'flex', gap: '8px'}}>
                      <button onClick={() => handleToggleCategory(category, false)} style={categoryButtonStyle} title={`Select all in ${category}`}>Select All</button>
                      <button onClick={() => handleToggleCategory(category, true)} style={categoryButtonStyle} title={`Deselect all in ${category}`}>Deselect All</button>
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
    <ConfirmDialog
        isOpen={isClearDialogOpen}
        title="Clear Pantry Items"
        message="Are you sure you want to remove all items marked as 'in pantry' from this list?"
        confirmText="Clear Items"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleClearPantryItemsConfirm}
        onCancel={() => setIsClearDialogOpen(false)}
    />
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

const globalActionButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#6c757d',
    color: 'white',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};


export default ShoppingList;