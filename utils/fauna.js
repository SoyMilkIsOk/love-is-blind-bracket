// utils/fauna.js
const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize Fauna client with secret from environment variable
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY
});

// Helper functions for common DB operations
const faunaQueries = {
  // User operations
  createUser: async (username) => {
    try {
      const result = await client.query(
        q.Create(
          q.Collection('Users'),
          {
            data: {
              username,
              joinedAt: new Date().toISOString()
            }
          }
        )
      );
      return { id: result.ref.id, ...result.data };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  getUserByUsername: async (username) => {
    try {
      const result = await client.query(
        q.Get(
          q.Match(q.Index('user_by_username'), username)
        )
      );
      return { id: result.ref.id, ...result.data };
    } catch (error) {
      // Return null if user not found
      if (error.name === 'NotFound') {
        return null;
      }
      console.error('Error getting user:', error);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const result = await client.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection('Users'))),
          q.Lambda(x => q.Get(x))
        )
      );
      return result.data.map(item => ({ id: item.ref.id, ...item.data }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Bracket operations
  getBracket: async (bracketId) => {
    try {
      const result = await client.query(
        q.Get(q.Ref(q.Collection('Brackets'), bracketId))
      );
      return { id: result.ref.id, ...result.data };
    } catch (error) {
      console.error('Error getting bracket:', error);
      throw error;
    }
  },

  getDefaultBracket: async () => {
    try {
      // Get the first bracket in the collection (for simplicity)
      const result = await client.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection('Brackets')), { size: 1 }),
          q.Lambda(x => q.Get(x))
        )
      );
      if (result.data.length === 0) {
        return null;
      }
      return { id: result.data[0].ref.id, ...result.data[0].data };
    } catch (error) {
      console.error('Error getting default bracket:', error);
      throw error;
    }
  },

  createDefaultBracket: async () => {
    try {
      const result = await client.query(
        q.Create(
          q.Collection('Brackets'),
          {
            data: {
              name: 'Love is Blind Season 8',
              currentEpisode: 1,
              couples: [
                {id: 1, names: "Joey and Monica"},
                {id: 2, names: "Ben and Sara"},
                {id: 3, names: "Dave and Lauren"},
                {id: 4, names: "Devin and Virginia"},
                {id: 5, names: "Daniel and Taylor"}
              ],
              createdAt: new Date().toISOString()
            }
          }
        )
      );
      return { id: result.ref.id, ...result.data };
    } catch (error) {
      console.error('Error creating default bracket:', error);
      throw error;
    }
  },

  advanceEpisode: async (bracketId) => {
    try {
      const bracket = await faunaQueries.getBracket(bracketId);
      const result = await client.query(
        q.Update(
          q.Ref(q.Collection('Brackets'), bracketId),
          {
            data: {
              currentEpisode: bracket.currentEpisode + 1
            }
          }
        )
      );
      return { id: result.ref.id, ...result.data };
    } catch (error) {
      console.error('Error advancing episode:', error);
      throw error;
    }
  },

  // Rankings operations
  submitRanking: async (userId, bracketId, episodeNumber, rankings) => {
    try {
      // First check if ranking already exists
      const existingRanking = await faunaQueries.getUserRankingForEpisode(userId, bracketId, episodeNumber);
      
      if (existingRanking) {
        // Update existing ranking
        const result = await client.query(
          q.Update(
            q.Ref(q.Collection('Rankings'), existingRanking.id),
            {
              data: {
                rankings,
                submittedAt: new Date().toISOString()
              }
            }
          )
        );
        return { id: result.ref.id, ...result.data };
      } else {
        // Create new ranking
        const result = await client.query(
          q.Create(
            q.Collection('Rankings'),
            {
              data: {
                userId,
                bracketId,
                episodeNumber,
                rankings,
                submittedAt: new Date().toISOString()
              }
            }
          )
        );
        return { id: result.ref.id, ...result.data };
      }
    } catch (error) {
      console.error('Error submitting ranking:', error);
      throw error;
    }
  },

  getUserRankingForEpisode: async (userId, bracketId, episodeNumber) => {
    try {
      const result = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index('ranking_by_user_bracket_episode'), [userId, bracketId, episodeNumber])
          ),
          q.Lambda(x => q.Get(x))
        )
      );
      if (result.data.length === 0) {
        return null;
      }
      return { id: result.data[0].ref.id, ...result.data[0].data };
    } catch (error) {
      console.error('Error getting user ranking:', error);
      return null;
    }
  },

  getRankingsForEpisode: async (bracketId, episodeNumber) => {
    try {
      const result = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index('rankings_by_bracket_episode'), [bracketId, episodeNumber])
          ),
          q.Lambda(x => q.Get(x))
        )
      );
      return result.data.map(item => ({ id: item.ref.id, ...item.data }));
    } catch (error) {
      console.error('Error getting rankings for episode:', error);
      throw error;
    }
  },

  getAllRankingsForBracket: async (bracketId) => {
    try {
      const result = await client.query(
        q.Map(
          q.Paginate(
            q.Match(q.Index('rankings_by_bracket'), bracketId)
          ),
          q.Lambda(x => q.Get(x))
        )
      );
      return result.data.map(item => ({ id: item.ref.id, ...item.data }));
    } catch (error) {
      console.error('Error getting all rankings for bracket:', error);
      throw error;
    }
  }
};

module.exports = faunaQueries;