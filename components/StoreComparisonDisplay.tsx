import React, { useState } from 'react';
import { ComparisonResult } from '../types';
import Loader from './Loader';
import ExportListModal from './ExportListModal';
import Toast from './Toast';

interface StoreComparisonDisplayProps {
  results: ComparisonResult[] | null;
  onCompare: (zipCode: string) => void;
  isComparing: boolean;
  selectedItemCount: number;
}

const StoreComparisonDisplay: React.FC<StoreComparisonDisplayProps> = ({ results, onCompare, isComparing, selectedItemCount }) => {
  const [zipCode, setZipCode] = useState('');
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCompareClick = () => {
    if (!/^\d{5}$/.test(zipCode)) {
        setValidationError("Please enter a valid 5-digit Zip Code.");
        return;
    }
    setValidationError(null);
    onCompare(zipCode);
  }

  // FIX: Cast the initial value of reduce to avoid using generics in the function call, which can cause issues.
  const stores = results ? results.reduce((acc, result) => {
    result.prices.forEach(p => {
      if (!acc.includes(p.store)) {
        acc.push(p.store);
      }
    });
    return acc;
  }, [] as string[]) : [];
  
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
    <>
    <div style={{ marginTop: '30px', borderTop: '1px solid #e0e0e0', paddingTop: '30px' }}>
      <h3 style={{marginTop: 0, fontSize: '1.5rem', color: '#4a4a4a'}}>Local Price Comparison</h3>
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <input 
            type="text" 
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            placeholder="Enter 5-Digit Zip Code"
            maxLength={5}
            style={{flexGrow: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px' }}
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
              <tr style={{backgroundColor: 'rgba(0,0,0,0.02)', fontWeight: 'bold'}}>
                  <td style={tableCellStyle}>Total</td>
                  {storeTotals.map(store => (
                      <td key={store.name} style={{ ...tableCellStyle, textAlign: 'right', color: store.name === bestStore.name && bestStore.total > 0 ? '#28a745' : 'inherit' }}>
                          ${store.total.toFixed(2)}
                      </td>
                  ))}
              </tr>
            </tfoot>
          </table>
        </div>
        {bestStore && bestStore.total > 0 && (
          <div style={{marginTop: '20px', textAlign: 'center'}}>
              <p style={{ fontWeight: 'bold', backgroundColor: '#e6ffed', padding: '12px', borderRadius: '8px', border: '1px solid #b7eb8f', color: '#096b00', display: 'inline-block', margin: '0 auto 20px auto' }}>
                  The best value is at <strong>{bestStore.name}</strong> with a total of <strong>${bestStore.total.toFixed(2)}</strong>.
              </p>
              <button onClick={() => setIsExportModalVisible(true)} style={exportButtonStyle}>
                  Compile & Export List for {bestStore.name}
              </button>
          </div>
        )}
        </>
      )}
    </div>
    {isExportModalVisible && results && bestStore.name && (
      <ExportListModal
          bestStoreName={bestStore.name}
          results={results}
          onClose={() => setIsExportModalVisible(false)}
      />
    )}
    <Toast
        message={validationError || ''}
        type="error"
        isVisible={!!validationError}
        onClose={() => setValidationError(null)}
        duration={4000}
    />
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#5A67D8', // Indigo
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
};

const exportButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#28a745', // Green
    display: 'block',
    margin: '0 auto',
};

const tableHeaderStyle: React.CSSProperties = {
    borderBottom: '2px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    fontWeight: 600,
    color: '#4a4a4a'
};

const tableCellStyle: React.CSSProperties = {
    borderBottom: '1px solid #eee',
    padding: '12px',
    color: '#555'
};


export default StoreComparisonDisplay;