const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API is running")
})

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productRoutes);

module.exports = app;