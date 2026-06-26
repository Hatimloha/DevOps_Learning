const { connectRedis } = require("./config/redis");

require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectRedis().catch(() => {
    console.log("Redis unavailable, continuing without cache");
  });

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
