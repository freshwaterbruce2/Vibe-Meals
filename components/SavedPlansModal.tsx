import React from 'react';
import { MealPlanSettings, MealPlanResponse } from '../types';

interface SavedPlan {
    name: string;
    id: number;
    settings: MealPlanSettings;
    mealPlan: MealPlanResponse;
}

interface SavedPlansModalProps {
    savedPlans: SavedPlan[];
    onLoad: (plan: SavedPlan) => void;
    onDelete: (id: number) => void;
    onClose: () => void;
}

const SavedPlansModal: React.FC<SavedPlansModalProps> = ({ savedPlans, onLoad, onDelete, onClose }) => {
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '16px' }}>
                    {/* FIX: Corrected typo from 'hh2' to 'h2' for the heading element. */}
                    <h2 style={{ margin: 0, color: '#4a4a4a' }}>My Saved Plans</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>
                {savedPlans.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '60vh', overflowY: 'auto' }}>
                        {savedPlans.map(plan => (
                            <li key={plan.id} style={planItemStyle}>
                                <div>
                                    <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: '#333' }}>{plan.name}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0 }}>
                                        {plan.settings.days} days for {plan.settings.people} people | Budget: ${plan.settings.budget}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => onLoad(plan)} style={actionButtonStyle}>Load</button>
                                    <button onClick={() => onDelete(plan.id)} style={{...actionButtonStyle, backgroundColor: '#dc3545'}}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px 0' }}>You have no saved plans yet.</p>
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
    maxWidth: '600px',
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

const planItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
};

const actionButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};


export default SavedPlansModal;