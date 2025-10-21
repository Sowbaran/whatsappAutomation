const express = require("express");
const app = express();
require("dotenv").config()
const path = require("path");
const fs = require("fs");
const port = process.env.PORT || 5000;
const db = require("./confg/dbConnnection")
const userRouter = require("./routes/userRoutes");
const orderRouter = require("./routes/orderRoutes");
const productRouter = require("./routes/productRoutes");
const salesmanRouter = require("./routes/salesmanRoutes");
const customerRouter = require("./routes/customerRoutes");
const dashboardRouter = require("./routes/dashboardRoutes");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
// require('./whatsappAutomation/whatsappApi');

db();

// CORS middleware - Add this before other middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = new Set([
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ]);
    if (origin && allowedOrigins.has(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());

// Serve images from whatsappAutomation folder
app.use('/images', express.static('./whatsappAutomation'));


app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decoded;
        } catch (err) {
        }
    }
    next();
});

// Paths to built React apps
const adminDist = path.join(__dirname, "../react-frontend/dist");
const salesmanDist = path.join(__dirname, "../react-frontend/react-frontend-salesman/dist");
console.log("[SPA Paths] adminDist=", adminDist);
console.log("[SPA Paths] salesmanDist=", salesmanDist);


// Favicon: avoid noisy 404
app.get('/favicon.ico', (_req, res) => res.sendStatus(204));



app.use("/api", userRouter);
app.use("/api/salesmen", salesmanRouter);
// API routes for orders, products, customers
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);
app.use("/api/customers", customerRouter);



// app.get("/he",(req,res)=>{
//     res.send("Hello world From the he ")
// })

app.use("", dashboardRouter);

// Health check endpoint for frontend status component
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Backend server is running",
        timestamp: new Date().toISOString()
    });
});

app.listen(port,()=>{
    console.log(`App is listening at port ${port}`)
})