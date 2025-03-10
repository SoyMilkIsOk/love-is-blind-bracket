// src/services/api.js

const API_URL = '/.netlify/functions';

const api = {
  // User-related API calls
  createUser: async (username) => {
    try {
      const response = await fetch(`${API_URL}/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },
  
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/getAllUsers`);
      
      if (!response.ok) {
        throw new Error('Failed to get users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },
  
  // Bracket-related API calls
  getDefaultBracket: async () => {
    try {
      const response = await fetch(`${API_URL}/getDefaultBracket`);
      
      if (!response.ok) {
        throw new Error('Failed to get default bracket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getDefaultBracket:', error);
      throw error;
    }
  },
  
  advanceEpisode: async (bracketId) => {
    try {
      const response = await fetch(`${API_URL}/advanceEpisode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bracketId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to advance episode');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in advanceEpisode:', error);
      throw error;
    }
  },
  
  // Rankings-related API calls
  submitRanking: async (userId, bracketId, episodeNumber, rankings) => {
    try {
      const response = await fetch(`${API_URL}/submitRanking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bracketId,
          episodeNumber,
          rankings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit ranking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in submitRanking:', error);
      throw error;
    }
  },
  
  getRankingsForEpisode: async (bracketId, episodeNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/getRankingsForEpisode?bracketId=${bracketId}&episodeNumber=${episodeNumber}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get rankings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getRankingsForEpisode:', error);
      throw error;
    }
  },
  
  getAllRankings: async (bracketId) => {
    try {
      const response = await fetch(
        `${API_URL}/getAllRankings?bracketId=${bracketId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get all rankings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in getAllRankings:', error);
      throw error;
    }
  },
};

export default api;