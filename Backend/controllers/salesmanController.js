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
        const { email, password } = req.body;
        const salesman = await Salesman.findOne({ email });
        if (!salesman) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, salesman.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const payload = { id: salesman._id, role: 'salesman', name: salesman.name || 'Salesman' };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
        console.log("salesman Token: ",token)
        // Always set SameSite=None and Secure for cross-origin local dev
        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: 'lax' });
        // Redirect to root; backend will serve salesman SPA for non-API routes when role==='salesman'
        res.json({ token, role: 'salesman', redirectUrl: '/' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
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
    // Show only orders that are not picked up and not assigned to any salesman
    const orders = await Order.find({ pickedUp: false, salesman: null }).populate('salesman', 'name');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ salesman: new mongoose.Types.ObjectId(req.user.id) }).populate('salesman', 'name');
        res.json(orders);
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
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { pickedUp: false, pickedUpBy: null, pickedUpAt: null, salesman: null },
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
        const salesman = await Salesman.findById(id);
        if (!salesman) return res.status(404).json({ msg: "Salesman not found" });
        res.json(salesman);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

module.exports = { login, getSalesmanProfile, getSalesmanOrders, getAssignedOrders, pickupOrder, dropOrder, createSalesman, updateSalesman, getSalesmanById };
