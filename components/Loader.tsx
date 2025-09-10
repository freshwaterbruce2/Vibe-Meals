import React from 'react';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
          }
        `}
      </style>
      <div className="spinner"></div>
      <h2 style={{ color: '#333' }}>{message || 'Loading...'}</h2>
      <p style={{ color: '#666' }}>This may take a moment. The AI is working its magic!</p>
    </div>
  );
};

export default Loader;
