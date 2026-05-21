const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const cors = require("cors");
const express = require("express");
const app = require("./app");
const sequelize = require("./config/db");
const { initSocket } = require("./socket");
const { extractBearerToken, verifyAuthToken } = require("./utils/auth");

// Import GraphQL
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const server = http.createServer(app);

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await apolloServer.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const token = extractBearerToken(req.headers.authorization || "");
        let user = null;
        if (token) {
          try {
            user = verifyAuthToken(token);
          } catch (err) {
            console.error("GraphQL Auth dynamic error:", err.message);
          }
        }
        return { user };
      },
    })
  );

  app.get("/", (req, res) => {
    res.send("GraphQL API running with Socket.io and REST Endpoints");
  });

  // Initialize Socket.io
  initSocket(server);

  sequelize
    .authenticate()
    .then(async () => {
      console.log("✅ Database connected");

      // Sync all models
      await sequelize.sync({ alter: true });

      const PORT = process.env.PORT || 5001;
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} with Sockets and GraphQL enabled`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start backend. Check your database settings.");
      console.error("❌ DB error:", err);
      process.exit(1);
    });
};

startServer();
