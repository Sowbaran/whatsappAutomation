const express = require("express");
const router =  express.Router();
const {dashboard,login,order,customers,products} = require("../controllers/dashboardController")
// const authMiddleware = require("../middleware/authMiddleware")

router.route("/dashboard").get(dashboard);
router.route("/orders").get(order);
router.route("/login").get(login);
router.route("/customers").get(customers);
router.route("/products").get(products);

module.exports = router