# This redis failed in kubernetes due to following reasons:
- session timeout
- api request hang
- hold the request 
- start request before redis ready and hang


```js
const Product = require("../models/productModel");
const { client: redis } = require("../config/redis")


exports.getAll = async (req, res) => {

  const cached = await redis.get("products");

  if (cached) {
    console.log("Cache Hit");
    return res.json(JSON.parse(cached));
  }

  console.log("Cache Miss");

  const data = await Product.getAll();

  await redis.set("products", JSON.stringify(data.rows), {
    EX: 60
  });

  res.json(data.rows);

};

exports.getById = async (req, res) => {
  const data = await Product.getById(req.params.id);
  res.json(data.rows[0]);
};

exports.create = async (req, res) => {
  const { name, price } = req.body;
  const data = await Product.create(name, price);
  await redis.del("products");
  res.json(data.rows[0]);
};

exports.update = async (req, res) => {
  const { name, price } = req.body;
  const data = await Product.update(req.params.id, name, price);
  await redis.del("products");
  res.json(data.rows[0]);
};

exports.remove = async (req, res) => {
  await Product.delete(req.params.id);
  await redis.del("products");
  res.json({ message: "Deleted" });
};
```