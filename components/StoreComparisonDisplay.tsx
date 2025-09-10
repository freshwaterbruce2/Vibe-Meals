import React, { useState } from 'react';
import { ComparisonResult } from '../types';
import Loader from './Loader';

interface StoreComparisonDisplayProps {
  results: ComparisonResult[] | null;
  onCompare: (zipCode: string) => void;
  isComparing: boolean;
  selectedItemCount: number;
}

const StoreComparisonDisplay: React.FC<StoreComparisonDisplayProps> = ({ results, onCompare, isComparing, selectedItemCount }) => {
  const [zipCode, setZipCode] = useState('');

  const handleCompareClick = () => {
    if (!/^\d{5}$/.test(zipCode)) {
        alert("Please enter a valid 5-digit Zip Code.");
        return;
    }
    onCompare(zipCode);
  }

  const stores = results ? results.reduce<string[]>((acc, result) => {
    result.prices.forEach(p => {
      if (!acc.includes(p.store)) {
        acc.push(p.store);
      }
    });
    return acc;
  }, []) : [];
  
  const storeTotals = stores.map(store => ({
      name: store,
      total: results?.reduce((sum, item) => {
          const storePrice = item.prices.find(p => p.store === store);
          return sum + (storePrice ? storePrice.price : 0);
      }, 0) || 0
  }));
  
  const bestStore = storeTotals.reduce((best, current) => {
      return current.total > 0 && current.total < best.total ? current : best;
  }, {name: '', total: Infinity});

  return (
    <div style={{ marginTop: '20px', border: '1px solid #dee2e6', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{marginTop: 0, fontSize: '1.5rem'}}>Local Price Comparison</h3>
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <input 
            type="text" 
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            placeholder="Enter 5-Digit Zip Code"
            maxLength={5}
            style={{flexGrow: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #ced4da', fontSize: '16px' }}
        />
        <button 
            onClick={handleCompareClick} 
            disabled={selectedItemCount === 0 || isComparing}
            style={{ ...buttonStyle, opacity: (selectedItemCount === 0 || isComparing) ? 0.5 : 1 }}
        >
            {isComparing ? 'Comparing...' : `Compare ${selectedItemCount} items`}
        </button>
      </div>

      {isComparing && <Loader message="Finding the best deals in your area..." />}
      
      {results && (
        <>
        <div style={{overflowX: 'auto'}}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Item</th>
                {stores.map(store => <th key={store} style={{...tableHeaderStyle, textAlign: 'right'}}>{store}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map(item => (
                <tr key={item.itemName}>
                  <td style={tableCellStyle}>{item.itemName}</td>
                  {stores.map(store => {
                    const priceInfo = item.prices.find(p => p.store === store);
                    return <td key={store} style={{...tableCellStyle, textAlign: 'right'}}>{priceInfo ? `$${priceInfo.price.toFixed(2)}` : '-'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}>
                  <td style={tableCellStyle}>Total</td>
                  {storeTotals.map(store => (
                      <td key={store.name} style={{ ...tableCellStyle, textAlign: 'right', color: store.name === bestStore.name && bestStore.total > 0 ? '#198754' : 'inherit' }}>
                          ${store.total.toFixed(2)}
                      </td>
                  ))}
              </tr>
            </tfoot>
          </table>
        </div>
        {bestStore && bestStore.total > 0 && (
          <p style={{marginTop: '20px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e6ffed', padding: '12px', borderRadius: '6px', border: '1px solid #b7eb8f', color: '#096b00'}}>
              The best value is at <strong>{bestStore.name}</strong> with a total of <strong>${bestStore.total.toFixed(2)}</strong>.
          </p>
        )}
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

const tableHeaderStyle: React.CSSProperties = {
    borderBottom: '2px solid #dee2e6',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontWeight: 600
};

const tableCellStyle: React.CSSProperties = {
    borderBottom: '1px solid #e9ecef',
    padding: '12px',
};


export default StoreComparisonDisplay;
