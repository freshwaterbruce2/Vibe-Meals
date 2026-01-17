import React, { useState } from 'react';
import { convertUnits } from '../services/geminiService';

interface UnitConverterProps {
    onClose: () => void;
}

const UnitConverter: React.FC<UnitConverterProps> = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('cup');
    const [toUnit, setToUnit] = useState('grams');
    const [ingredient, setIngredient] = useState('flour');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConvert = async () => {
        if (!amount || !fromUnit || !toUnit || !ingredient) {
            setError("Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const converted = await convertUnits(amount, fromUnit, toUnit, ingredient);
            setResult(converted);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to convert units.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, color: '#4a4a4a' }}>AI Unit Converter</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'flex-end', marginBottom: '16px'}}>
                    <div style={{gridColumn: '1 / -1'}}>
                        <label htmlFor="ingredient" style={labelStyle}>Ingredient</label>
                        <input type="text" id="ingredient" value={ingredient} onChange={e => setIngredient(e.target.value)} style={inputStyle} placeholder="e.g., flour, sugar, water"/>
                    </div>
                     <div>
                        <label htmlFor="amount" style={labelStyle}>Amount</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="fromUnit" style={labelStyle}>From</label>
                        <input type="text" id="fromUnit" value={fromUnit} onChange={e => setFromUnit(e.target.value)} style={inputStyle} placeholder="e.g., cups, oz, tbsp"/>
                    </div>
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', fontWeight: 600, color: '#555'}}>to</div>
                     <div style={{gridColumn: '1 / -1'}}>
                        <label htmlFor="toUnit" style={labelStyle}>To</label>
                        <input type="text" id="toUnit" value={toUnit} onChange={e => setToUnit(e.target.value)} style={inputStyle} placeholder="e.g., grams, ml, tsp"/>
                    </div>
                </div>

                <button onClick={handleConvert} disabled={isLoading} style={{...buttonStyle, width: '100%', marginTop: '8px'}}>
                    {isLoading ? 'Converting...' : 'Convert'}
                </button>

                {error && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '16px' }}>{error}</p>}

                {result && (
                    <div style={{marginTop: '20px', backgroundColor: '#e6ffed', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <p style={{margin: 0, color: '#096b00', fontSize: '1.2rem', fontWeight: 600}}>{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
};

const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    lineHeight: 1,
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
  backgroundColor: '#fff',
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


export default UnitConverter;