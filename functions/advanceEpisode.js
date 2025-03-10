// functions/advanceEpisode.js
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
    const { bracketId } = JSON.parse(event.body);

    if (!bracketId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing bracketId' })
      };
    }

    const updatedBracket = await faunaQueries.advanceEpisode(bracketId);
    
    return {
      statusCode: 200,
      body: JSON.stringify(updatedBracket)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to advance episode' })
    };
  }
};