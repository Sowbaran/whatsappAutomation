const path = require("path")
const express = require("express");
const app = express();

// NOTE: These routes are commented out because we're using React for the frontend
// React handles all routing on the client side
// If you need these routes, they should return JSON data instead of HTML files

// app.use(express.static(path.join(__dirname, "../../Frontend")));

const dashboard = (req, res) => {
    console.log("Dashboard route called - returning JSON")
    res.json({ message: "Dashboard API endpoint", status: "success" });
};


const order = (req, res) => {
    console.log("Order route called - returning JSON")
    res.json({ message: "Orders API endpoint", status: "success" });
};


const customers = (req, res) => {
    console.log("Customers route called - returning JSON")
    res.json({ message: "Customers API endpoint", status: "success" });
};


const products = (req, res) => {
    console.log("Products route called - returning JSON")
    res.json({ message: "Products API endpoint", status: "success" });
};



const login = (req, res) => {
    console.log("Login route called - returning JSON")
    res.json({ message: "Login API endpoint", status: "success" });
};

module.exports = {dashboard,login,order,customers,products} ;