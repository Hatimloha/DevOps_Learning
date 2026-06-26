const express = require("express");
const cors = require("cors");
const { client } = require("./config/redis")

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running")
})

app.get("/health", async (req, res) => {
  const redisStatus = client.isOpen ? "up" : "down";

  res.json({
    status: "ok",
    redis: redisStatus,
  });
});

app.use("/products", productRoutes);

module.exports = app;