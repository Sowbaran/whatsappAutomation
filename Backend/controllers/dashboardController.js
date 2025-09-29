const path = require("path")
const express = require("express");
const app = express();


app.use(express.static(path.join(__dirname, "../../Frontend")));

const dashboard = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "admin.html"));
};


const order = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "orders.html"));
};


const customers = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "customers.html"));
};


const products = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "products.html"));
};



const login = (req, res) => {
    console.log("Hello World From dashboard!!!")
 res.sendFile(path.join(__dirname, "../../Frontend", "login.html"));
};

module.exports = {dashboard,login,order,customers,products} ;