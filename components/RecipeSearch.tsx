import React, { useState } from 'react';
import { Recipe } from '../types';
import RecipeCard from './RecipeCard';
import Loader from './Loader';

interface RecipeSearchProps {
    onSearch: (query: string) => void;
    searchResults: Recipe[] | null;
    isSearching: boolean;
    searchError: string | null;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ onSearch, searchResults, isSearching, searchError }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div style={glassCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: '1.75rem', color: '#4a4a4a' }}>Recipe Finder</h2>
            <p style={{ color: '#6c757d', marginTop: 0, marginBottom: '20px' }}>
                Looking for something specific? Find individual recipes to inspire your next meal.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g., 'quick chicken pasta' or 'vegan breakfast ideas'"
                    style={{ flexGrow: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px' }}
                />
                <button type="submit" disabled={isSearching} style={{ ...buttonStyle, opacity: isSearching ? 0.6 : 1 }}>
                    {isSearching ? 'Searching...' : 'Find Recipes'}
                </button>
            </form>

            {isSearching && <Loader message="Searching for delicious recipes..." />}
            {searchError && <p style={{ color: '#dc3545', textAlign: 'center' }}>Error: {searchError}</p>}
            
            {searchResults && (
                <div>
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


export default RecipeSearch;
