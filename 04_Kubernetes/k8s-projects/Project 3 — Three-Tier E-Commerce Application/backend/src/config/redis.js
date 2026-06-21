const { createClient } = require("redis");

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
});

client.on("error", err => console.log(err));

(async () => {
  await client.connect();
  console.log("Redis Connected");
})();

module.exports = client;