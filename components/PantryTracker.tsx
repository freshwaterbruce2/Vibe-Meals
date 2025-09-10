import React, { useState } from 'react';

const PantryTracker: React.FC = () => {
    const [pantryItems, setPantryItems] = useState<string[]>(['Salt', 'Pepper', 'Olive Oil']);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem && !pantryItems.includes(newItem)) {
            setPantryItems([...pantryItems, newItem].sort());
            setNewItem('');
        }
    };
    
    const handleRemoveItem = (itemToRemove: string) => {
        setPantryItems(pantryItems.filter(item => item !== itemToRemove));
    };

    return (
        <div style={{ marginTop: '40px', border: '1px solid #dee2e6', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.75rem' }}>Pantry Tracker</h2>
            <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '20px' }}>
                Keep track of items you have on hand. This will be used in the future to automatically adjust your shopping list.
            </p>
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Add an item to your pantry"
                    style={{ flexGrow: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '16px' }}
                />
                <button type="submit" style={buttonStyle}>Add Item</button>
            </form>
            <div>
                {pantryItems.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {pantryItems.map(item => (
                            <li key={item} style={{ backgroundColor: '#e9ecef', padding: '8px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item}
                                <button onClick={() => handleRemoveItem(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6c757d', fontWeight: 'bold', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>&times;</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#6c757d' }}>Your pantry is empty. Add some items you commonly have!</p>
                )}
            </div>
        </div>
    );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#28a745',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

export default PantryTracker;
