// components/BracketDisplay.js
import React from 'react';

function BracketDisplay({ completedEpisodes, getRankingsForEpisode, couples, users }) {
  if (completedEpisodes.length === 0) {
    return (
      <div className="bracket-display empty-bracket">
        <h2>Current Bracket</h2>
        <p>No episodes have been completed yet. Be the first to submit your predictions!</p>
      </div>
    );
  }

  return (
    <div className="bracket-display">
      <h2>Current Bracket Standings</h2>
      
      {completedEpisodes.map(episodeNumber => {
        const episodeRankings = getRankingsForEpisode(episodeNumber);
        
        return (
          <div key={episodeNumber} className="episode-section">
            <h3>Episode {episodeNumber} Predictions</h3>
            
            <div className="bracket-table-container">
              <table className="bracket-table">
                <thead>
                  <tr>
                    <th>Couple</th>
                    {users.map(user => (
                      <th key={user.id}>{user.username}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {couples.map(couple => (
                    <tr key={couple.id}>
                      <td className="couple-cell">{couple.names}</td>
                      
                      {users.map(user => {
                        // Find this user's ranking for this couple
                        const userRanking = episodeRankings.find(r => r.userId === user.id);
                        const coupleRank = userRanking ? 
                          userRanking.rankings.find(rank => rank.coupleId === couple.id)?.rank || '-' : 
                          '-';
                        
                        return (
                          <td 
                            key={user.id} 
                            className={`rank-cell rank-${coupleRank}`}
                          >
                            {coupleRank}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BracketDisplay;