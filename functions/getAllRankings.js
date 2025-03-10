// functions/getAllRankings.js
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
    const { bracketId } = event.queryStringParameters;

    if (!bracketId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing bracketId parameter' })
      };
    }

    const rankings = await faunaQueries.getAllRankingsForBracket(bracketId);
    
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
