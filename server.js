const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: './variables.env' });

const Recipe = require('./models/Recipe');
const User = require('./models/User');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Bring in GraphQL middleware
const { ApolloServer } = require('apollo-server-express');

const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

// Create Schema
const app = express();

const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function() {
  return this.toString();
};
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: ({ req }) => ({
    Recipe,
    User
  }),
  playground: {
    endpoint: 'http://localhost:4444/graphql'
  }
});
app.use(async (req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== 'null' || token !== typeof undefined) {
    try {
      const currentUser = await jwt.verify(token, process.env.SECRET);
      console.log(currentUser);
    } catch (err) {
      console.error(err);
    }
  }

  next();
});
server.applyMiddleware({
  app: app
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DB CONNECTED'))
  .catch(err => console.error(err));

// JWT authentication

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
