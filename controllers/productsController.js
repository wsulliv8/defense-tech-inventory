const fs = require("fs");
const path = require("path");
const db = require("../db/queries");

const getProducts = async (req, res) => {
  try {
    const categories = await db.getCategories();
    const categoryId = req.query.category_id
      ? parseInt(req.query.category_id)
      : null;
    console.log("Getting Products...");
    const products = categoryId
      ? await db.getProductsByCategoryId(categoryId)
      : await db.getProducts();
    res.render("products/index", {
      products: products,
      categories,
      title: "All Products",
      selectedCategoryId: categoryId,
    });
  } catch (err) {
    console.error("Error in get all products: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: err.message.includes("Database Error")
        ? "Database Issue - please try again"
        : "Something went wrong fetching products",
      referer: req.headers.referer || "/products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting Product with ID: ${id}`);
    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Product not found",
        referer: req.headers.referer || "/products",
      });
    }
    res.render("products/show", {
      product: product,
      title: product.name,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to fetch product details",
      referer: req.headers.referer || "/products",
    });
  }
};

const getNewProductForm = async (req, res) => {
  try {
    const categories = await db.getCategories();
    const selectedCategoryId = req.query.category_id
      ? parseInt(req.query.category_id)
      : null;
    res.render("products/new", {
      title: "Add Product",
      categories,
      selectedCategoryId,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Unable to load new product form.",
      referer: req.headers.referer || "/products",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, part_number, status, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const normCategory_id =
      category_id && category_id !== "" ? parseInt(category_id, 10) : null;
    console.log(`Creating Product:${name}, Image ${image_url}`);
    await db.createProduct(
      name,
      part_number,
      status,
      normCategory_id,
      image_url
    );
    res.redirect("/products");
  } catch (error) {
    console.error("Error creating product", error);
    res.status(500).render("error", {
      title: "error",
      message: "Unable to create product",
      referer: req.headers.referer || "/products",
    });
  }
};

const getEditProductForm = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).render("pages/error", {
        title: "Not Found",
        message: "Product not found.",
        referer: req.headers.referer || "/products",
      });
    }
    const categories = await db.getCategories();
    res.render("products/edit", {
      product,
      categories,
      title: `Edit ${product.name}`,
    });
  } catch (error) {
    console.error("Error fetching product for edit:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Unable to load edit form.",
      referer: req.headers.referer || "/products",
    });
  }
};

const updateProduct = async (req, res) => {
  let uploadedFilePath = null;
  try {
    const { id } = req.params;
    const { name, description, part_number, status, category_id } = req.body;
    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).render("pages/error", {
        title: "Not Found",
        message: "Product not found.",
        referer: req.headers.referer || "/products",
      });
    }

    const normCategory_id =
      category_id && category_id !== "" ? parseInt(category_id, 10) : null;
    const newImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : product.image_url;
    uploadedFilePath = req.file
      ? path.join(__dirname, "../public/uploads", req.file.filename)
      : null;

    console.log(
      `Updating Product ID: ${id}, Name: ${name}, Category ID: ${normCategory_id}, Image: ${newImageUrl}`
    );
    await db.updateProduct(
      id,
      name,
      description,
      part_number,
      status,
      normCategory_id,
      newImageUrl
    );

    if (req.file && product.image_url) {
      const oldImagePath = path.join(
        __dirname,
        "../public/uploads",
        product.image_url.split("/uploads/")[1]
      );
      try {
        await fs.unlink(oldImagePath);
        console.log(`Deleted old image ${oldImagePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete old image", unlinkError);
      }
    }

    res.redirect(`/products/${id}`);
  } catch (error) {
    console.error("Error updating product:", error);
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log(`Deleted orphaned file: ${uploadedFilePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete file", unlinkError);
      }
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Product not found.",
        referer: req.headers.referer || "/products",
      });
    }

    console.log(`Deleting Product ID: ${id}, Name: ${product.name}`);
    await db.deleteProduct(id);

    if (product.image_url) {
      const imagePath = path.join(
        __dirname,
        "../public/uploads",
        product.image_url.split("/uploads/")[1]
      );
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete image:", unlinkError);
      }
    }

    res.redirect("/products");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to delete product.",
      referer: req.headers.referer || "/products",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  getNewProductForm,
  createProduct,
  getEditProductForm,
  updateProduct,
  deleteProduct,
};
