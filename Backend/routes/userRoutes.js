const express = require("express");
const router =  express.Router();
const user = require("../controllers/userController")
const authMiddleware = require("../middleware/authMiddleware")

router.route("/admin").post(authMiddleware,user);

module.exports = router