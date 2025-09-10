import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

// FIX: Re-created component to resolve module errors
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
      <h2 style={{ color: '#d46b08' }}>Oops! Something went wrong.</h2>
      <p style={{ color: '#d46b08', maxWidth: '600px', margin: '0 auto 20px auto' }}>{error || 'An unexpected error occurred.'}</p>
      <button onClick={onRetry} style={{ padding: '12px 24px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  );
};

export default ErrorDisplay;
