import React from 'react';

interface AboutPageProps {
    onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    return (
        <div style={glassCardStyle}>
            <h2 style={titleStyle}>About AuraChef</h2>
            <p style={paragraphStyle}>
                Welcome to AuraChef, your personal AI-powered meal planning assistant! Our mission is to take the stress out of your daily routine by making meal planning simple, affordable, and perfectly tailored to your lifestyle.
            </p>

            <h3 style={subtitleStyle}>How It Works</h3>
            <p style={paragraphStyle}>
                AuraChef leverages the power of Google's advanced Gemini AI to create customized meal plans based on your unique needs. Simply provide your weekly budget, the number of people you're cooking for, and any dietary preferences, and our AI will craft a delicious and cost-effective plan just for you.
            </p>

            <h3 style={subtitleStyle}>Key Features</h3>
            <ul style={listStyle}>
                <li><strong>Personalized Plans:</strong> Get meal plans that fit your budget, household size, and dietary needs.</li>
                <li><strong>Smart Shopping Lists:</strong> Automatically generate organized, categorized shopping lists.</li>
                <li><strong>Local Price Comparison:</strong> Find the best grocery prices in your area to maximize savings.</li>
                <li><strong>Pantry Tracking:</strong> Keep track of what you already have to reduce waste and smarten up your shopping.</li>
                <li><strong>Recipe Discovery:</strong> Instantly replace any meal you don't like or search for new recipe ideas.</li>
                <li><strong>Save & Load:</strong> Keep your favorite meal plans handy for future use.</li>
            </ul>

            <p style={paragraphStyle}>
                We believe that everyone deserves to eat well without the hassle. Whether you're a busy professional, a family on a budget, or just looking for new culinary inspiration, AuraChef is here to help you save time, eat well, and stay on budget.
            </p>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                 <button onClick={onBack} style={backButtonStyle}>
                    Back to Planner
                </button>
            </div>
        </div>
    );
};

const glassCardStyle: React.CSSProperties = {
  padding: '40px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '20px',
  margin: '40px 0',
  backgroundColor: 'rgba(255, 255, 255, 0.75)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(10px)',
  color: '#4a4a4a'
};

const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '2rem',
};

const subtitleStyle: React.CSSProperties = {
    marginTop: '2rem',
    marginBottom: '1rem',
    fontSize: '1.5rem',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    paddingBottom: '0.5rem'
};

const paragraphStyle: React.CSSProperties = {
    lineHeight: 1.6,
    fontSize: '1.1rem',
    marginBottom: '1rem'
};

const listStyle: React.CSSProperties = {
    lineHeight: 1.7,
    fontSize: '1.1rem',
    paddingLeft: '20px',
};

const backButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#8A2BE2', // BlueViolet
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};


export default AboutPage;
