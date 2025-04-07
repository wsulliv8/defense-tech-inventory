require("dotenv").config();
const express = require("express");
const path = require("path");
const multer = require("multer");
const app = express();
const indexRouter = require("./routes/indexRouter");
const productsRouter = require("./routes/productsRouter");
const categoriesRouter = require("./routes/categoriesRouter");
const materialsRouter = require("./routes/materialsRouter");

const PORT = process.env.APP_PORT || 3000;

// setup Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.orginalname)}`
    );
  },
});
const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "/views/pages"),
  path.join(__dirname, "/views/partials"),
]);
app.use(express.urlencoded({ extended: true })); // allow parsing complex POST requests
app.use(express.static(path.join(__dirname, "public"))); // make public folder available for access for CSS files

app.use("/", indexRouter);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
