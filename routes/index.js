var express = require("express");
var multer = require("multer");
var router = express.Router();
var upload = multer();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Not Allowed" });
});

// Controllers
var userController = require("../controllers/user.controller");

// middleware
var auth = require('../middleware/auth')

// User
router.get("/user/lists", auth, userController.lists);
router.get("/user/info", auth, userController.info);
router.post("/user/store", [upload.none()], userController.store);
router.post("/user/update", [auth, upload.none()], userController.update);
router.post("/user/destroy", [auth, upload.none()], userController.destroy);



module.exports = router;
