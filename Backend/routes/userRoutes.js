const express = require("express");
const router =  express.Router();
const { user, logout } = require("../controllers/userController")
const { login } = require("../controllers/salesmanController");
const authMiddleware = require("../middleware/authMiddleware")
const path = require("path");

router.route("/login").post(user);
router.route("/salesman/login").get((req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/salesman_login.html"));
}).post(login);
router.route("/logout").post(logout);

module.exports = router