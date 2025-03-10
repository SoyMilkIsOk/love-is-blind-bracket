// App.js - Main Application Component with Backend Integration
import React, { useState, useEffect } from 'react';
import './App.css';
import UserRegistration from './components/UserRegistration';
import BracketDisplay from './components/BracketDisplay';
import RankingForm from './components/RankingForm';
import api from './services/api';
import Cookies from 'js-cookie';  // Add this package for cookie management

function App() {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bracket, setBracket] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Load user from cookies and initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        // Check for user ID in cookies
        const userId = Cookies.get('userId');
        const username = Cookies.get('username');
        
        if (userId && username) {
          setCurrentUser({ id: userId, username });
        }
        
        // Get bracket info
        const bracketData = await api.getDefaultBracket();
        setBracket(bracketData);
        
        // Get all users
        const users = await api.getAllUsers();
        setAllUsers(users);
        
        // Get all rankings for this bracket
        if (bracketData) {
          const allRankings = await api.getAllRankings(bracketData.id);
          setRankings(allRankings);
          
          // Check if current user has submitted for current episode
          if (userId) {
            const hasUserSubmitted = allRankings.some(
              r => r.userId === userId && r.episodeNumber === bracketData.currentEpisode
            );
            setHasSubmitted(hasUserSubmitted);
          }
        }
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Failed to load application data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeApp();
    
    // Clean up polling interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  // Set up polling for updates once bracket is loaded
  useEffect(() => {
    if (bracket && !pollingInterval) {
      // Poll for updates every 10 seconds
      const interval = setInterval(async () => {
        try {
          // Check for bracket updates
          const bracketData = await api.getDefaultBracket();
          setBracket(bracketData);
          
          // Check for new rankings
          const allRankings = await api.getAllRankings(bracketData.id);
          setRankings(allRankings);
          
          // Check for new users
          const users = await api.getAllUsers();
          setAllUsers(users);
        } catch (err) {
          console.error('Error polling for updates:', err);
        }
      }, 10000);
      
      setPollingInterval(interval);
    }
  }, [bracket, pollingInterval]);

  // Handle user registration
  const handleRegister = async (username) => {
    try {
      const user = await api.createUser(username);
      setCurrentUser(user);
      
      // Set cookies to persist user session
      Cookies.set('userId', user.id, { expires: 30 }); // 30 days
      Cookies.set('username', user.username, { expires: 30 }); // 30 days
      
      // Update users list
      setAllUsers(prevUsers => {
        if (!prevUsers.find(u => u.id === user.id)) {
          return [...prevUsers, user];
        }
        return prevUsers;
      });
    } catch (err) {
      console.error('Error registering user:', err);
      setError('Failed to register. Please try a different username.');
    }
  };

  // Handle ranking submission
  const handleSubmitRankings = async (coupleRankings) => {
    try {
      if (!currentUser || !bracket) return;
      
      await api.submitRanking(
        currentUser.id,
        bracket.id,
        bracket.currentEpisode,
        coupleRankings
      );
      
      setHasSubmitted(true);
      
      // Update rankings state
      const updatedRankings = await api.getAllRankings(bracket.id);
      setRankings(updatedRankings);
    } catch (err) {
      console.error('Error submitting rankings:', err);
      setError('Failed to submit rankings. Please try again.');
    }
  };

  // Check if all users have submitted rankings for current episode
  const areAllUsersSubmitted = () => {
    if (!bracket || !allUsers.length || !rankings.length) return false;
    
    return allUsers.every(user => 
      rankings.some(r => 
        r.userId === user.id && 
        r.episodeNumber === bracket.currentEpisode
      )
    );
  };

  // Advance to next episode
  const handleAdvanceEpisode = async () => {
    try {
      if (!bracket) return;
      
      const updatedBracket = await api.advanceEpisode(bracket.id);
      setBracket(updatedBracket);
      setHasSubmitted(false);
    } catch (err) {
      console.error('Error advancing episode:', err);
      setError('Failed to advance to next episode. Please try again.');
    }
  };

  // Reset user for testing
  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('username');
    setCurrentUser(null);
    setHasSubmitted(false);
  };

  // Get episodes that have rankings
  const getCompletedEpisodes = () => {
    if (!rankings.length) return [];
    
    // Get unique episode numbers from rankings
    const episodeNumbers = [...new Set(rankings.map(r => r.episodeNumber))];
    
    // Only include episodes before current
    return episodeNumbers
      .filter(epNum => bracket && epNum < bracket.currentEpisode)
      .sort((a, b) => a - b);
  };

  // Filter rankings for a specific episode
  const getRankingsForEpisode = (episodeNumber) => {
    return rankings.filter(r => r.episodeNumber === episodeNumber);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <h2>Loading bracket competition...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Love is Blind Season 8 Bracket Competition</h1>
        {currentUser && (
          <div className="user-info">
            <p>Playing as: <strong>{currentUser.username}</strong></p>
            <button className="logout-btn" onClick={handleLogout}>Reset User</button>
          </div>
        )}
      </header>

      <main>
        {!currentUser ? (
          <UserRegistration onRegister={handleRegister} />
        ) : (
          <>
            {bracket && (
              <div className="episode-info">
                <h2>Current Episode: {bracket.currentEpisode}</h2>
              </div>
            )}
            
            <BracketDisplay 
              completedEpisodes={getCompletedEpisodes()} 
              getRankingsForEpisode={getRankingsForEpisode}
              couples={bracket?.couples || []} 
              users={allUsers}
            />
            
            {!hasSubmitted && bracket ? (
              <RankingForm 
                couples={bracket.couples} 
                onSubmit={handleSubmitRankings}
                currentEpisode={bracket.currentEpisode}
                users={allUsers}
                rankings={rankings.filter(r => r.episodeNumber === bracket.currentEpisode)}
              />
            ) : (
              bracket && (
                <div className="episode-complete">
                  <h3>Thank you for submitting your rankings for Episode {bracket.currentEpisode}!</h3>
                  {areAllUsersSubmitted() && currentUser && (
                    <button 
                      className="advance-btn"
                      onClick={handleAdvanceEpisode}
                    >
                      All users submitted - Advance to Episode {bracket.currentEpisode + 1}
                    </button>
                  )}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;