// components/UserRegistration.js
import React, { useState } from 'react';

function UserRegistration({ onRegister }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    // Check if username is at least 3 characters
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onRegister(username.trim());
    } catch (err) {
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>Welcome to the Love is Blind Bracket!</h2>
      <p>Enter a username to get started with your predictions.</p>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="username">Choose a Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            disabled={isSubmitting}
          />
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={!username.trim() || isSubmitting}
        >
          {isSubmitting ? 'Starting...' : 'Start Playing'}
        </button>
      </form>
    </div>
  );
}

export default UserRegistration;