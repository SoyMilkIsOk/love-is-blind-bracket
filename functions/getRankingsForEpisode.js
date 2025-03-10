// functions/getRankingsForEpisode.js
const faunaQueries = require('../utils/fauna');

exports.handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { bracketId, episodeNumber } = event.queryStringParameters;

    if (!bracketId || !episodeNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const rankings = await faunaQueries.getRankingsForEpisode(bracketId, parseInt(episodeNumber));
    
    return {
      statusCode: 200,
      body: JSON.stringify(rankings)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get rankings' })
    };
  }
};