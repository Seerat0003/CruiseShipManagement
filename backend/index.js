const express = require("express");
const cors = require("cors");
const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/db");
const { initSocket } = require("./socket");

// Import GraphQL
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

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
        const token = req.headers.authorization?.replace("Bearer ", "") || "";
        let user = null;
        if (token) {
          try {
            user = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
          } catch (err) {
            console.error("GraphQL Auth dynamic error:", err.message);
          }
        }
        return { user };
      },
    })
  );

  app.get("/", (req, res) => {
    res.send("GraphQL API running with Socket.io");
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
