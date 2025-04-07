const pool = require("./pool");

const getProducts = async () => {
  try {
    const { rows } = await pool.query(
      "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC"
    );
    return rows;
  } catch (err) {
    console.log(`Database Error: ${err.message}`);
  }
};

const getProductById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
  }
};

const createProduct = async (
  name,
  part_number,
  status,
  category_id,
  image_url
) => {
  const result = await pool.query(
    "INSERT INTO products (name, part_number, status, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, part_number, status, category_id, image_url]
  );
  return result.rows[0];
};

const updateProduct = async (
  id,
  name,
  description,
  part_number,
  status,
  category_id,
  image_url
) => {
  const result = await pool.query(
    "UPDATE products SET name = $1, description = $2, part_number = $3, status = $4, category_id = $5, image_url = $6 WHERE id = $7 RETURNING *",
    [name, description, part_number, status, category_id, image_url, id]
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

async function getProductsByCategoryId(category_id) {
  const result = await pool.query(
    "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = $1 ORDER BY p.created_at DESC",
    [category_id]
  );
  return result.rows;
}

async function getCategories() {
  //const result = await pool.query("SELECT * FROM categories ORDER BY name");
  const result = await pool.query(
    "SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY c.name"
  );
  return result.rows;
}

async function getCategoryById(id) {
  const result = await pool.query("SELECT * FROM categories WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
}

async function createCategory(name, description, image_url) {
  const result = await pool.query(
    "INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *",
    [name, description, image_url]
  );
  return result.rows[0];
}

async function updateCategory(id, name, description, image_url) {
  const result = await pool.query(
    "UPDATE categories SET name = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *",
    [name, description, image_url, id]
  );
  return result.rows[0];
}

async function deleteCategory(id) {
  const result = await pool.query(
    "DELETE FROM categories WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategoryId,
};
