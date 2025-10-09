import React, { useState } from 'react';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import Loader from './Loader';

interface RecipeSearchProps {
    onSearch: (query: string, includeIngredients: string[], excludeIngredients: string[]) => void;
    searchResults: Recipe[] | null;
    isSearching: boolean;
    searchError: string | null;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSearch, searchResults, isSearching, searchError }) => {
    const [query, setQuery] = useState('');
    const [includeIngredients, setIncludeIngredients] = useState('');
    const [excludeIngredients, setExcludeIngredients] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const include = includeIngredients.split(',').map(s => s.trim()).filter(Boolean);
            const exclude = excludeIngredients.split(',').map(s => s.trim()).filter(Boolean);
            onSearch(query.trim(), include, exclude);
        }
    };

    return (
        <div style={glassCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.75rem', color: '#4a4a4a' }}>Recipe Finder</h2>
            <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '20px' }}>
                Looking for something specific? Find individual recipes to inspire your next meal.
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="e.g., 'quick chicken pasta' or 'vegan breakfast ideas'"
                        style={{ flexGrow: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px' }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                     <div>
                        <label htmlFor="search-include" style={labelStyle}>Include Ingredients</label>
                        <input type="text" id="search-include" value={includeIngredients} onChange={e => setIncludeIngredients(e.target.value)} placeholder="e.g., tomatoes, basil" style={inputStyle} />
                        <p style={helperTextStyle}>Separate with commas</p>
                    </div>
                    <div>
                        <label htmlFor="search-exclude" style={labelStyle}>Exclude Ingredients</label>
                        <input type="text" id="search-exclude" value={excludeIngredients} onChange={e => setExcludeIngredients(e.target.value)} placeholder="e.g., dairy, gluten" style={inputStyle} />
                        <p style={helperTextStyle}>Separate with commas</p>
                    </div>
                </div>
                <button type="submit" disabled={isSearching} style={{ ...buttonStyle, width: '100%' }}>
                    {isSearching ? 'Searching...' : 'Find Recipes'}
                </button>
            </form>

            {isSearching && <Loader message="Searching for delicious recipes..." />}
            {searchError && <p style={{ color: '#dc3545', textAlign: 'center', marginTop: '20px' }}>Error: {searchError}</p>}
            
            {searchResults && (
                <div style={{marginTop: '30px'}}>
                    <h3 style={{ color: '#4a4a4a' }}>Search Results</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {searchResults.map((recipe, index) => (
                            <RecipeCard key={`${recipe.name}-${index}`} recipe={recipe} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const glassCardStyle: React.CSSProperties = {
  padding: '24px 40px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(10px)',
  marginTop: '40px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 500,
  fontSize: '14px',
  color: '#4a4a4a'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '15px',
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

const helperTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '6px',
    marginBottom: 0
};

export default RecipeSearch;