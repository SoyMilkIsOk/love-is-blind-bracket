// functions/getDefaultBracket.js
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
    // Get the default bracket, or create one if it doesn't exist
    let bracket = await faunaQueries.getDefaultBracket();
    
    if (!bracket) {
      bracket = await faunaQueries.createDefaultBracket();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(bracket)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get bracket' })
    };
  }
};