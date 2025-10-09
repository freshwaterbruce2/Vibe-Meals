import React, { useState, useEffect } from 'react';
import { ComparisonResult } from '../types';
import { generateExportableList } from '../services/geminiService';

interface ExportListModalProps {
    bestStoreName: string;
    results: ComparisonResult[];
    onClose: () => void;
}

const ExportListModal: React.FC<ExportListModalProps> = ({ bestStoreName, results, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
    const [formattedList, setFormattedList] = useState<string>('Generating your optimized list...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateList = async () => {
            setIsLoading(true);
            try {
                // Prepare the item list for the service
                const itemsForStore = results
                    .map(item => {
                        const storePriceInfo = item.prices.find(p => p.store === bestStoreName);
                        // Only include items that have a price at the best store
                        if (storePriceInfo && storePriceInfo.price > 0) {
                            return { itemName: item.itemName, price: storePriceInfo.price };
                        }
                        return null;
                    })
                    .filter((item): item is { itemName: string; price: number } => item !== null);

                if (itemsForStore.length > 0) {
                    const aiGeneratedList = await generateExportableList(bestStoreName, itemsForStore);
                    setFormattedList(aiGeneratedList);
                } else {
                    setFormattedList('No items with prices found for this store.');
                }
            } catch (error) {
                console.error('Failed to generate exportable list:', error);
                setFormattedList('Sorry, there was an error generating the list. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        generateList();
    }, [bestStoreName, results]);

    const handleCopy = () => {
        if (isLoading) return;
        navigator.clipboard.writeText(formattedList).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy list to clipboard.');
        });
    };
    
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, color: '#4a4a4a' }}>Optimized Shopping List</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>

                <textarea
                    readOnly
                    value={formattedList}
                    style={textAreaStyle}
                />

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '16px'}}>
                   <button onClick={onClose} style={secondaryButtonStyle}>Close</button>
                   <button onClick={handleCopy} style={{...primaryButtonStyle, opacity: isLoading ? 0.6 : 1}} disabled={isLoading}>
                       {isLoading ? 'Generating...' : copyButtonText}
                    </button>
                </div>
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
    maxWidth: '500px',
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

const textAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '250px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    boxSizing: 'border-box'
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#28a745',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, opacity 0.2s ease',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: '#6c757d',
};


export default ExportListModal;
