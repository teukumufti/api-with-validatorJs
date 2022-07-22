var express = require("express");
var multer = require("multer");
const path = require("path");
var router = express.Router();

//! Use of Multer
var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/images/"); // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Not Allowed" });
});

// Controllers
var userController = require("../controllers/user.controller");
var productController = require("../controllers/product.controller");
var transactionController = require("../controllers/transaction.controller");

// middleware
var auth = require("../middleware/auth");

// User
router.get("/user/lists", userController.lists);
router.get("/user/info", auth, userController.info);
router.post("/user/store", [upload.none()], userController.store);
router.post("/user/update", [auth, upload.none()], userController.update);
router.post("/user/destroy", [auth, upload.none()], userController.destroy);

// product
router.get("/product/lists", productController.lists);
router.get("/product/info", productController.info);
router.post(
  "/product/store",
  upload.single("product_image"),
  productController.store
);
router.post("/product/update", productController.update);
router.post("/product/destroy", productController.destroy);

// transaction
router.get("/transaction/lists", transactionController.lists);
router.get("/transaction/info", transactionController.info);
router.post("/transaction/store", transactionController.store);
// router.post("/transaction/update", transactionController.update);
router.post("/transaction/destroy", transactionController.destroy);

module.exports = router;
