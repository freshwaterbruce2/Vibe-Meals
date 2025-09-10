import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{ textAlign: 'center', margin: '20px 0 40px 0' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#212529', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
        AuraChef
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#6c757d', margin: 0 }}>
        Your intelligent partner for smart, simple, and delicious meal planning.
      </p>
    </header>
  );
};

export default Header;
