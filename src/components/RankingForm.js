// components/RankingForm.js
import React, { useState, useEffect } from 'react';

function RankingForm({ couples, onSubmit, currentEpisode, users, rankings }) {
  // Initialize rankings state
  const [userRankings, setUserRankings] = useState(
    couples.map(couple => ({ coupleId: couple.id, rank: null }))
  );
  
  // Track used ranks to prevent duplicates
  const [usedRanks, setUsedRanks] = useState([]);
  
  // Check if form is valid (all couples ranked with unique values)
  const isFormValid = userRankings.every(item => item.rank !== null) && 
                      usedRanks.length === couples.length;
  
  // Update usedRanks whenever rankings change
  useEffect(() => {
    const ranks = userRankings
      .map(item => item.rank)
      .filter(rank => rank !== null);
    setUsedRanks([...new Set(ranks)]);
  }, [userRankings]);

  // Handle rank change for a couple
  const handleRankChange = (coupleId, rank) => {
    // Parse rank to number
    const numRank = parseInt(rank);
    
    // Update rankings
    const updatedRankings = userRankings.map(item => {
      if (item.coupleId === coupleId) {
        return { ...item, rank: numRank };
      }
      return item;
    });
    
    setUserRankings(updatedRankings);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormValid) {
      onSubmit(userRankings);
    }
  };

  // Check if a rank is already used by another couple
  const isRankUsed = (rank, currentCoupleId) => {
    return userRankings.some(item => 
      item.rank === rank && item.coupleId !== currentCoupleId
    );
  };

  // Get other users who have submitted for this episode
  const getUsersWithSubmissions = () => {
    return users.filter(user => 
      rankings.some(r => r.userId === user.id)
    );
  };

  return (
    <div className="ranking-form-container">
      <h2>Episode {currentEpisode} Predictions</h2>
      <p>Rank each couple from 1-5 (5 = highest confidence they'll get married, 1 = lowest)</p>
      
      <div className="other-users-status">
        <h3>Player Status:</h3>
        <ul className="user-status-list">
          {users.map(user => {
            const hasSubmitted = rankings.some(
              r => r.userId === user.id
            );
            
            return (
              <li key={user.id} className={`user-status ${hasSubmitted ? 'submitted' : 'pending'}`}>
                {user.username}: {hasSubmitted ? '✓ Submitted' : '⏳ Pending'}
              </li>
            );
          })}
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="ranking-form">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>Couple</th>
              {getUsersWithSubmissions().map(user => (
                <th key={user.id}>{user.username}</th>
              ))}
              <th>Your Ranking</th>
            </tr>
          </thead>
          <tbody>
            {couples.map(couple => {
              // Get rankings from other users for this couple
              const otherUsersRankings = getUsersWithSubmissions().map(user => {
                const userRanking = rankings.find(
                  r => r.userId === user.id
                );
                
                if (!userRanking) return null;
                
                const coupleRank = userRanking.rankings.find(
                  r => r.coupleId === couple.id
                )?.rank;
                
                return {
                  userId: user.id,
                  username: user.username,
                  rank: coupleRank
                };
              }).filter(Boolean);
              
              return (
                <tr key={couple.id}>
                  <td className="couple-cell">{couple.names}</td>
                  
                  {otherUsersRankings.map(userRank => (
                    <td 
                      key={userRank.userId}
                      className={`rank-cell rank-${userRank.rank}`}
                    >
                      {userRank.rank}
                    </td>
                  ))}
                  
                  <td className="rank-input-cell">
                    <select
                      value={userRankings.find(r => r.coupleId === couple.id)?.rank || ''}
                      onChange={(e) => handleRankChange(couple.id, e.target.value)}
                      className={`rank-select ${isRankUsed(parseInt(userRankings.find(r => r.coupleId === couple.id)?.rank), couple.id) ? 'duplicate-error' : ''}`}
                    >
                      <option value="">Select Rank</option>
                      {[1, 2, 3, 4, 5].map(num => (
                        <option 
                          key={num} 
                          value={num}
                          disabled={isRankUsed(num, couple.id)}
                        >
                          {num}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <button 
          type="submit" 
          className={`submit-ranking-btn ${isFormValid ? 'active' : 'disabled'}`}
          disabled={!isFormValid}
        >
          Submit Predictions
        </button>
      </form>
    </div>
  );
}

export default RankingForm;