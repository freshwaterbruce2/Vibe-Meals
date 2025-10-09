import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  title: string;
  recipe: Recipe;
  onReplace: () => void;
  isReplacing: boolean;
}

const DetailItem: React.FC<{ icon: string; value: string | number | undefined; label: string }> = ({ icon, value, label }) => {
    if (value === undefined || value === null) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#555' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <div>
                <strong>{value}</strong>
                <span style={{ marginLeft: '4px' }}>{label}</span>
            </div>
        </div>
    );
};

const NutritionItem: React.FC<{ label: string; value: number | undefined; color: string }> = ({ label, value, color }) => {
    if (value === undefined || value === null) return null;
    return (
        <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color }}>{Math.round(value)}g</div>
            <div style={{ color: '#6c757d' }}>{label}</div>
        </div>
    )
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
  
  const hasNutrition = recipe.protein_grams !== undefined || recipe.carbs_grams !== undefined || recipe.fat_grams !== undefined;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#8A2BE2' }}>{title}</h4>
        <span style={{fontSize: '0.9rem', fontWeight: 500, backgroundColor: 'rgba(138, 43, 226, 0.1)', color: '#8A2BE2', padding: '4px 8px', borderRadius: '4px'}}>
            ~${recipe.estimated_cost.toFixed(2)}
        </span>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600, color: '#333' }}>{recipe.name}</p>

      <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginBottom: '16px', padding: '10px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', flexWrap: 'wrap' }}>
            <DetailItem icon="🕒" value={recipe.prep_time_minutes} label="min prep" />
            <DetailItem icon="🔥" value={recipe.cook_time_minutes} label="min cook" />
            <DetailItem icon="📊" value={recipe.total_calories} label="calories" />
        </div>
        {hasNutrition && (
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', marginTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                <NutritionItem label="Protein" value={recipe.protein_grams} color="#3b82f6" />
                <NutritionItem label="Carbs" value={recipe.carbs_grams} color="#f59e0b" />
                <NutritionItem label="Fat" value={recipe.fat_grams} color="#ef4444" />
            </div>
        )}
      </div>

      {isExpanded && (
        <>
          <h5 style={{color: '#555'}}>Ingredients:</h5>
          <ul style={{ paddingLeft: '20px', margin: '0 0 10px 0', fontSize: '0.95rem', color: '#4a4a4a' }}>
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>
          <h5 style={{color: '#555'}}>Instructions:</h5>
          <ol style={{ paddingLeft: '20px', margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: 1.6, color: '#4a4a4a' }}>
            {recipe.instructions.map((step, index) => (
              <li key={index} style={{marginBottom: '4px'}}>{step}</li>
            ))}
          </ol>
        </>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
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
  border: '1px solid rgba(255, 255, 255, 0.2)', 
  borderRadius: '16px', 
  padding: '20px', 
  backgroundColor: 'rgba(255, 255, 255, 0.85)', 
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  flexDirection: 'column'
};

const primaryButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#999',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
};

const secondaryButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: 'transparent',
    color: '#555',
    border: '1px solid #ccc',
};

export default RecipeCard;