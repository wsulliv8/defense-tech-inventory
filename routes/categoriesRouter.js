const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });

router.get("/", categoriesController.getAllCategories);
router.get("/new", categoriesController.getNewCategoryForm);
router.get("/:id", categoriesController.getCategory);
router.get("/:id/edit", categoriesController.getEditCategoryForm);
router.post("/", upload.single("image"), categoriesController.createCategory);
router.post(
  "/:id",
  upload.single("image"),
  categoriesController.updateCategory
);
router.post("/:id/delete", categoriesController.deleteCategory);

module.exports = router;
