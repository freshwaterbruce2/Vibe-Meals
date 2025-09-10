import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  title: string;
  recipe: Recipe;
  onReplace: () => void;
  isReplacing: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, recipe, onReplace, isReplacing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recipe) {
    return (
      <div style={cardStyle}>
        <h4>{title}</h4>
        <p>No recipe available.</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0d6efd' }}>{title}</h4>
        <span style={{fontSize: '0.9rem', fontWeight: 500, backgroundColor: '#e7f1ff', color: '#0d6efd', padding: '4px 8px', borderRadius: '4px'}}>
            ~${recipe.estimated_cost.toFixed(2)}
        </span>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>{recipe.name}</p>

      {isExpanded && (
        <>
          <h5>Ingredients:</h5>
          <ul style={{ paddingLeft: '20px', margin: '0 0 10px 0', fontSize: '0.95rem' }}>
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>
          <h5>Instructions:</h5>
          <ol style={{ paddingLeft: '20px', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {recipe.instructions.map((step, index) => (
              <li key={index} style={{marginBottom: '4px'}}>{step}</li>
            ))}
          </ol>
        </>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #e9ecef' }}>
        <button onClick={() => setIsExpanded(!isExpanded)} style={secondaryButtonStyle}>
            {isExpanded ? 'Show Less' : 'Show Details'}
        </button>
        <button onClick={onReplace} disabled={isReplacing} style={{...primaryButtonStyle, opacity: isReplacing ? 0.6 : 1, position: 'relative' }}>
          {isReplacing && <Spinner />}
          <span style={{visibility: isReplacing ? 'hidden' : 'visible'}}>Replace</span>
        </button>
      </div>
    </div>
  );
};

const Spinner = () => (
    <>
    <style>{`
        @keyframes card-spinner-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}</style>
    <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: '-10px',
        marginLeft: '-10px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        animation: 'card-spinner-spin 0.8s linear infinite'
    }}></div>
    </>
);


const cardStyle: React.CSSProperties = { 
  border: '1px solid #dee2e6', 
  borderRadius: '12px', 
  padding: '20px', 
  backgroundColor: 'white', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column'
};

const primaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#6c757d',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

const secondaryButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: '1px solid #ced4da',
};


export default RecipeCard;
