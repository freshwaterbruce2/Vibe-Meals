import React from 'react';

interface HeaderProps {
    onShowPlans: () => void;
    hasPlans: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShowPlans, hasPlans }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0', position: 'relative' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-1px', textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        AuraChef
      </h1>
      {hasPlans && (
          <button onClick={onShowPlans} style={myPlansButtonStyle}>
              My Plans
          </button>
      )}
    </header>
  );
};

const myPlansButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '10px 20px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(5px)',
};

export default Header;