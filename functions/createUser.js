// functions/createUser.js
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
    const { username } = JSON.parse(event.body);

    if (!username || username.trim().length < 3) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username must be at least 3 characters' })
      };
    }

    // Check if username already exists
    const existingUser = await faunaQueries.getUserByUsername(username);
    if (existingUser) {
      return {
        statusCode: 200,
        body: JSON.stringify(existingUser)
      };
    }

    // Create new user
    const user = await faunaQueries.createUser(username);
    
    return {
      statusCode: 201,
      body: JSON.stringify(user)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user' })
    };
  }
};