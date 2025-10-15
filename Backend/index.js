const express = require("express");
const app = express();
require("dotenv").config()
const path = require("path");
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
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(cookieParser());

// Serve images from whatsappAutomation folder
app.use('/images', express.static('./whatsappAutomation'));

app.use((req, res, next) => {
    const token = req.cookies.token;
    // console.log("INDEX JS:",token)
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = decoded;
        } catch (err) {
            // Invalid token, proceed as a guest
        }
    }
    next();
});

// Serve static files: restrict salesmen to their folder only
app.use((req, res, next) => {
    if (req.user && req.user.role === 'salesman') {
        // Only allow static files from frontend_for_salesman
        express.static(path.join(__dirname, "../Frontend/frontend_for_salesman"))(req, res, next);
    } else {
        // Admins and others get full frontend
        express.static(path.join(__dirname, "../Frontend"))(req, res, next);
    }
});

// Block direct access to admin pages for salesmen
app.use((req, res, next) => {
    if (req.user && req.user.role === 'salesman') {
        // If trying to access any page outside frontend_for_salesman, redirect
        const allowed = [
            '/salesman/orders',
            '/salesman/profile',
            '/salesman/assigned-orders',
            '/login',
            '/api/login',
            '/api/logout'
        ];
        if (!allowed.includes(req.path) && !req.path.startsWith('/api/')) {
            return res.redirect('/salesman/assigned-orders');
        }
    }
    next();
});

app.use("/api", userRouter);
app.use("/api/salesmen", salesmanRouter);
// API routes for orders, products, customers
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);
app.use("/api/customers", customerRouter);

// Serve static files from Frontend folder

// Redirect routes to HTML pages with role checks
app.get("/products", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/products.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/customers", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/customers.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/orders", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/orders.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/admin", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/admin.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/sales_progres", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/sales_progres.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/order-details", (req, res) => {
    if (req.user && req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, "../Frontend/order-details.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/salesman/orders", (req, res) => {
    if (req.user && req.user.role === 'salesman') {
        res.sendFile(path.join(__dirname, "../Frontend/frontend_for_salesman/salesman_orders.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/salesman/profile", (req, res) => {
    if (req.user && req.user.role === 'salesman') {
        res.sendFile(path.join(__dirname, "../Frontend/frontend_for_salesman/profile.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/salesman/assigned-orders", (req, res) => {
    if (req.user && req.user.role === 'salesman') {
        res.sendFile(path.join(__dirname, "../Frontend/frontend_for_salesman/asignedOrder.html"));
    } else {
        res.redirect('/login');
    }
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/Login.html"));
});
app.get("/salesman/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/salesman_login.html"));
});

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