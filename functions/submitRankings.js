// functions/submitRanking.js
const faunaQueries = require('../utils/fauna');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { userId, bracketId, episodeNumber, rankings } = JSON.parse(event.body);

    if (!userId || !bracketId || !episodeNumber || !rankings || !Array.isArray(rankings)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Validate rankings
    if (rankings.length !== 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Must rank exactly 5 couples' })
      };
    }

    // Check for duplicate ranks
    const ranks = rankings.map(r => r.rank);
    if (new Set(ranks).size !== ranks.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Duplicate ranks are not allowed' })
      };
    }

    // Submit ranking
    const result = await faunaQueries.submitRanking(userId, bracketId, episodeNumber, rankings);
    
    return {
      statusCode: 201,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit ranking' })
    };
  }
};
