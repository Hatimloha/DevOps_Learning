const { createClient } = require("redis");

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: () => false
  }
});

client.on("error", (err) => {
  console.log("Redis Error:", err);
});


let redisConnected = false;

const connectRedis = async () => {
  try {
    await client.connect();
    redisConnected = true;
    console.log("Redis Connected");
  } catch (err) {
    redisConnected = false;
    console.log("Redis disabled");
  }
};

module.exports = { client, connectRedis };