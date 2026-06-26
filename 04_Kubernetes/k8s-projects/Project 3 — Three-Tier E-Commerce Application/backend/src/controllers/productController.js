const Product = require("../models/productModel");
const { client: redis } = require("../config/redis");

/**
 * Helper: safe Redis GET (never blocks request)
 */
const safeGet = async (key) => {
  try {
    if (!redis?.isOpen) return null;
    return await redis.get(key);
  } catch (err) {
    console.log("[Redis GET failed]", err.message);
    return null;
  }
};

/**
 * Helper: safe Redis SET (non-blocking cache)
 */
const safeSet = async (key, value, ttl = 60) => {
  try {
    if (!redis?.isOpen) return;

    await redis.set(key, value, {
      EX: ttl,
    });
  } catch (err) {
    console.log("[Redis SET failed]", err.message);
  }
};

/**
 * Helper: safe Redis DEL
 */
const safeDel = async (key) => {
  try {
    if (!redis?.isOpen) return;
    await redis.del(key);
  } catch (err) {
    console.log("[Redis DEL failed]", err.message);
  }
};

/**
 * GET ALL PRODUCTS (Cache-first, DB fallback)
 */
exports.getAll = async (req, res) => {
  // 1. Try cache (NON-BLOCKING)
  try {
    const cached = await safeGet("products");

    if (cached) {
      console.log("Cache Hit");
      return res.json(JSON.parse(cached));
    }

    console.log("Cache Miss");

    // 2. Always fallback to DB
    const data = await Product.getAll();

    // 3. Best-effort cache write (DO NOT block response)
    safeSet("products", JSON.stringify(data.rows), 60);

    return res.json(data.rows);
  } catch (err) {
    console.log("getAll error:", err.message);

    const data = await Product.getAll();
    return res.json(data.rows);
  }
};

/**
 * GET BY ID (no cache needed)
 */
exports.getById = async (req, res) => {
  const data = await Product.getById(req.params.id);
  return res.json(data.rows[0]);
};

/**
 * CREATE PRODUCT
 */
exports.create = async (req, res) => {
  const { name, price } = req.body;

  const data = await Product.create(name, price);

  // best-effort cache invalidation
  safeDel("products");

  return res.json(data.rows[0]);
};

/**
 * UPDATE PRODUCT
 */
exports.update = async (req, res) => {
  const { name, price } = req.body;

  const data = await Product.update(req.params.id, name, price);

  safeDel("products");

  return res.json(data.rows[0]);
};

/**
 * DELETE PRODUCT
 */
exports.remove = async (req, res) => {
  await Product.delete(req.params.id);

  safeDel("products");

  return res.json({ message: "Deleted" });
};