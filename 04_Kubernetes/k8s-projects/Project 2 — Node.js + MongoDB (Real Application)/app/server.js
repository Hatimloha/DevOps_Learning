const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoHost = process.env.MONGO_HOST;

const mongoURL = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:27017/k8s-project2`;

mongoose.connect(mongoURL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const Item = mongoose.model("Item", {
  name: String
});

app.get("/", (req, res) => {
  res.send("Node-Mongo App Running");
});

app.post("/add", async (req, res) => {
  const item = new Item({ name: req.body.name });
  await item.save();
  res.send("Item Added");
});

app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.listen(3000, () => console.log("Server running on 3000"));