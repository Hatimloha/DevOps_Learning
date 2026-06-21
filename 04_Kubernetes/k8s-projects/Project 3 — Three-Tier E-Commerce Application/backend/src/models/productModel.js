const db = require("../config/db");

const Product = {
  async getAll() {
    return db.query("SELECT * FROM products ORDER BY id DESC");
  },

  async getById(id) {
    return db.query("SELECT * FROM products WHERE id = $1", [id]);
  },

  async create(name, price) {
    return db.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
  },

  async update(id, name, price) {
    return db.query(
      "UPDATE products SET name=$1, price=$2 WHERE id=$3 RETURNING *",
      [name, price, id]
    );
  },

  async delete(id) {
    return db.query("DELETE FROM products WHERE id=$1", [id]);
  },
};

module.exports = Product;