const express = require("express");
const router =  express.Router();
const dashboard = require("../controllers/dashboardController")
// const authMiddleware = require("../middleware/authMiddleware")

router.route("/dashboard").get(dashboard);

module.exports = router