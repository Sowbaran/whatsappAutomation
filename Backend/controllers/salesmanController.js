const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require('mongoose');
const Salesman = require("../models/salesmanModel.js");
const Order = require("../models/orderModel.js");


// const router = express.Router();







const login = async (req, res) => {
    try {
        console.log('Login attempt with:', { email: req.body.email });
        
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const salesman = await Salesman.findOne({ email }).select('+password');
        if (!salesman) {
            console.log('No salesman found with email:', email);
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        console.log('Found salesman:', { id: salesman._id, email: salesman.email });
        
        const isMatch = await bcrypt.compare(password, salesman.password);
        if (!isMatch) {
            console.log('Password does not match for email:', email);
            return res.status(400).json({ msg: "Invalid email or password" });
        }

        const payload = { 
            id: salesman._id, 
            role: 'salesman', 
            name: salesman.name || 'Salesman',
            email: salesman.email
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
        
        console.log('Login successful, generated token for user:', { 
            id: salesman._id, 
            email: salesman.email 
        });

        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res.json({ 
            success: true, 
            token, 
            role: 'salesman', 
            redirectUrl: '/',
            user: {
                id: salesman._id,
                name: salesman.name,
                email: salesman.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ 
            success: false, 
            msg: "An error occurred during login",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const createSalesman = async (req, res) => {
    try {
        const { name, email, phone, password, region } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ msg: "name, email, phone and password are required" });
        }
        const exists = await Salesman.findOne({ email });
        if (exists) {
            return res.status(409).json({ msg: "Salesman with this email already exists" });
        }
        const hashed = await bcrypt.hash(password, 10);
        const s = await Salesman.create({ name, email, phone, password: hashed, region });
        res.status(201).json(s);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const updateSalesman = async (req, res) => {
    try {
        const { id } = req.params;
        const update = { ...req.body };
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }
        const s = await Salesman.findByIdAndUpdate(id, update, { new: true });
        if (!s) return res.status(404).json({ msg: "Salesman not found" });
        res.json(s);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getSalesmanProfile = async (req, res) => {
    try {
        const salesman = await Salesman.findById(req.user.id).select("-password");
        if (!salesman) {
            return res.status(404).json({ msg: "Salesman not found" });
        }
        // Ensure region and joinedDate are always present
        const profile = {
            name: salesman.name || '',
            email: salesman.email || '',
            phone: salesman.phone || '',
            region: salesman.region || '',
            joinedDate: salesman.joinedAt ? new Date(salesman.joinedAt).toLocaleDateString() : '',
            _id: salesman._id
        };
        res.json(profile);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getSalesmanOrders = async (req, res) => {
    try {
        const currentSalesmanId = req.user.id;
        // Show orders that are either unassigned OR assigned to the current salesman
        const orders = await Order.find({
            $or: [
                { salesman: null },
                { salesman: new mongoose.Types.ObjectId(currentSalesmanId) }
            ]
        }).populate('salesman', 'name');
        // Attach computed flags for pickup/drop buttons
        const out = orders.map(o => {
            const obj = (o.toObject && typeof o.toObject === 'function') ? o.toObject() : o;
            const isPendingOrProcessing = obj.status === 'pending' || obj.status === 'processing';
            obj.pickedUp = obj.pickedUp || false;
            obj.canPickup = isPendingOrProcessing && !obj.pickedUp;
            obj.canDrop = isPendingOrProcessing && obj.pickedUp;
            return obj;
        });
        res.json(out);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ salesman: new mongoose.Types.ObjectId(req.user.id) }).populate('salesman', 'name');
        // For assigned orders, include the same `canPickup` flag (will be false for assigned orders)
        const out = orders.map(o => {
            const obj = (o.toObject && typeof o.toObject === 'function') ? o.toObject() : o;
            obj.canPickup = (obj.status === 'pending' && !obj.pickedUp && (!obj.salesman || obj.salesman === null));
            return obj;
        });
        res.json(out);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const pickupOrder = async (req, res) => {
    try {
        console.log("PickupOrder called by user:", req.user);
        const { id } = req.params; // Note: this uses :id, not :orderId
        const salesmanId = new mongoose.Types.ObjectId(req.user.id);
        const order = await Order.findById(id);
        if (!order) {
            console.log("Order not found:", id);
            return res.status(404).json({ msg: 'Order not found' });
        }

        const wasAssigned = order.salesman != null;
        const newStatus = wasAssigned ? 'processing' : 'picked up';

        // Add timeline entry for pickup
        const timelineEntry = {
            action: 'Order Picked Up by Salesman',
            description: `Order picked up by salesman ${req.user.name}`,
            date: new Date(),
            updatedBy: req.user.name
        };

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                pickedUp: true,
                pickedUpBy: salesmanId,
                salesman: salesmanId,
                pickedUpAt: new Date(),
                status: newStatus,
                $push: { timeline: timelineEntry }
            },
            { new: true }
        ).populate('salesman');
        res.json(updatedOrder);
    } catch (err) {
        console.error("Error in pickupOrder:", err);
        res.status(500).json({ msg: err.message });
    }
};

const dropOrder = async (req, res) => {
    try {
        console.log("DropOrder called by user:", req.user);
        const { orderId } = req.params;
        
        // Add timeline entry for drop
        const timelineEntry = {
            action: 'Order Dropped by Salesman',
            description: `Order dropped by salesman ${req.user.name}`,
            date: new Date(),
            updatedBy: req.user.name
        };
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { 
                pickedUp: false, 
                pickedUpBy: null, 
                pickedUpAt: null, 
                salesman: null,
                status: 'pending',
                $push: { timeline: timelineEntry }
            },
            { new: true }
        );
        if (!updatedOrder) {
            console.log("Order not found:", orderId);
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (err) {
        console.error("Error in dropOrder:", err);
        res.status(500).json({ msg: err.message });
    }
};

// Get a specific salesman by ID (including password hash)
const getSalesmanById = async (req, res) => {
    try {
        const { id } = req.params;
        const salesman = await Salesman.findById(id).select("-password");
        if (!salesman) return res.status(404).json({ msg: "Salesman not found" });
        // Return only the profile fields in the same format as getSalesmanProfile
        const profile = {
            name: salesman.name || '',
            email: salesman.email || '',
            phone: salesman.phone || '',
            region: salesman.region || '',
            joinedDate: salesman.joinedAt ? new Date(salesman.joinedAt).toLocaleDateString() : '',
            _id: salesman._id
        };
        res.json(profile);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Get a single order by ID with salesman authorization
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('getOrderById - Requested order ID:', id);
        console.log('getOrderById - User ID:', req.user?.id);
        
        // Find order by ID or orderId
        const query = {
            $or: [
                { _id: id },
                { orderId: id }
            ]
        };
        
        console.log('getOrderById - Query:', JSON.stringify(query));
        
        let order = await Order.findOne(query).populate('salesman', 'name email phone');
        console.log('getOrderById - Found order:', order ? 'Yes' : 'No');

        if (!order) {
            console.log('getOrderById - Order not found with ID:', id);
            return res.status(404).json({ 
                success: false,
                msg: 'Order not found',
                query: query,
                orderId: id
            });
        }

        // Check if the order is assigned to the current salesman
        if (order.salesman) {
            const salesmanId = order.salesman._id?.toString() || order.salesman.toString();
            console.log('getOrderById - Order salesman ID:', salesmanId);
            console.log('getOrderById - Requesting user ID:', req.user.id);
            
            if (salesmanId !== req.user.id) {
                console.log('getOrderById - Unauthorized: Order not assigned to this salesman');
                return res.status(403).json({ 
                    success: false,
                    msg: 'Not authorized to view this order',
                    orderId: id,
                    salesmanId: salesmanId,
                    userId: req.user.id
                });
            }
        } else {
            console.log('getOrderById - Order has no assigned salesman');
        }

        console.log('getOrderById - Sending order data');
        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        console.error('Error in getOrderById:', err);
        res.status(500).json({ 
            success: false,
            msg: 'Server error',
            error: err.message 
        });
    }
};

module.exports = { 
    login, 
    getSalesmanProfile, 
    getSalesmanOrders, 
    getAssignedOrders, 
    pickupOrder, 
    dropOrder, 
    createSalesman, 
    updateSalesman, 
    getSalesmanById,
    getOrderById 
};
