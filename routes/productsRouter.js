const { Router } = require("express");
const controller = require("../controllers/productsController");
const path = require("path");
const multer = require("multer");
const router = Router();

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

router.get("/", controller.getProducts);
router.get("/new", controller.getNewProductForm);
router.get("/:id", controller.getProduct);
router.get("/:id/edit", controller.getEditProductForm);
router.post("/", upload.single("image"), controller.createProduct);
router.post("/:id", upload.single("image"), controller.updateProduct);
router.post("/:id/delete", controller.deleteProduct);

module.exports = router;
