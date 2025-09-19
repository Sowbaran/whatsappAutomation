const path = require("path")
const express = require("express");
const app = express();


app.use(express.static(path.join(__dirname, "../../Frontend")));

const dashboard = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "admin.html"));
};

module.exports = dashboard ;