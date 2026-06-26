# Database Setup (IMPORTANT)
Run this in PostgreSQL:
```bash
CREATE DATABASE products;

\c products;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price INT
);
```