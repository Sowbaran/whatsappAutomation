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

        const token = jwt.sign({ id: salesman._id, role: 'salesman' }, process.env.JWT_SECRET_KEY, { expiresIn: "24h" });
        console.log("salesman Token: ",token)
        res.cookie("token", token, { httpOnly: true });
        res.json({ token, role: 'salesman', redirectUrl: '/salesman/orders' });
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
        res.json(salesman);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

const getSalesmanOrders = async (req, res) => {
    try {
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
            { pickedUp: false, pickedUpBy: null, pickedUpAt: null },
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

module.exports = { login, getSalesmanProfile, getSalesmanOrders, getAssignedOrders, pickupOrder, dropOrder };
