const db = require("../db/queries");
const fs = require("fs").promises;
const path = require("path");

const getAllCategories = async (req, res) => {
  try {
    const categories = await db.getCategories();
    res.render("categories/index", { categories, title: "All Categories" });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to fetch categories.",
      referer: req.headers.referer || "/products",
    });
  }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.getCategoryById(id);
    if (!category) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Category not found.",
        referer: req.headers.referer || "/categories",
      });
    }
    const products = await db.getProductsByCategoryId(id);
    res.render("categories/show", { category, products, title: category.name });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to fetch category.",
      referer: req.headers.referer || "/categories",
    });
  }
};

const getNewCategoryForm = (req, res) => {
  res.render("categories/new", { title: "Add Category" });
};

const createCategory = async (req, res) => {
  let uploadedFilePath = null;
  try {
    const { name, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    uploadedFilePath = req.file
      ? path.join(__dirname, "../public/uploads", req.file.filename)
      : null;
    console.log(`Creating Category: ${name}, Image: ${image_url}`);
    await db.createCategory(name, description, image_url);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error creating category:", error);
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log(`Deleted orphaned file: ${uploadedFilePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete file:", unlinkError);
      }
    }
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to create category.",
      referer: req.headers.referer || "/categories",
    });
  }
};

const getEditCategoryForm = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.getCategoryById(id);
    if (!category) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Category not found.",
        referer: req.headers.referer || "/categories",
      });
    }
    res.render("categories/edit", { category, title: `Edit ${category.name}` });
  } catch (error) {
    console.error("Error fetching category for edit:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to load edit form.",
      referer: req.headers.referer || "/categories",
    });
  }
};

const updateCategory = async (req, res) => {
  let uploadedFilePath = null;
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await db.getCategoryById(id);
    if (!category) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Category not found.",
        referer: req.headers.referer || "/categories",
      });
    }
    const newImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : category.image_url;
    uploadedFilePath = req.file
      ? path.join(__dirname, "../public/uploads", req.file.filename)
      : null;

    console.log(
      `Updating Category ID: ${id}, Name: ${name}, Image: ${newImageUrl}`
    );
    await db.updateCategory(id, name, description, newImageUrl);

    if (req.file && category.image_url) {
      const oldImagePath = path.join(
        __dirname,
        "../public/uploads",
        category.image_url.split("/uploads/")[1]
      );
      try {
        await fs.unlink(oldImagePath);
        console.log(`Deleted old image: ${oldImagePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete old image:", unlinkError);
      }
    }

    res.redirect(`/categories/${id}`);
  } catch (error) {
    console.error("Error updating category:", error);
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log(`Deleted orphaned file: ${uploadedFilePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete file:", unlinkError);
      }
    }
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to update category.",
      referer: req.headers.referer || "/categories",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.getCategoryById(id);
    if (!category) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Category not found.",
        referer: req.headers.referer || "/categories",
      });
    }

    console.log(`Deleting Category ID: ${id}, Name: ${category.name}`);
    await db.deleteCategory(id);

    if (category.image_url) {
      const imagePath = path.join(
        __dirname,
        "../public/uploads",
        category.image_url.split("/uploads/")[1]
      );
      try {
        await fs.unlink(imagePath);
        console.log(`Deleted image: ${imagePath}`);
      } catch (unlinkError) {
        console.error("Failed to delete image:", unlinkError);
      }
    }

    res.redirect("/categories");
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Unable to delete category.",
      referer: req.headers.referer || "/categories",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategory,
  getNewCategoryForm,
  createCategory,
  getEditCategoryForm,
  updateCategory,
  deleteCategory,
};
