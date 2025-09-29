const express = require('express');
const router = express.Router();
const { getSalesmanProfile, getSalesmanOrders, getAssignedOrders, pickupOrder, dropOrder } = require('../controllers/salesmanController');
const authMiddleware = require('../middleware/authMiddleware');
const Salesman = require('../models/salesmanModel');
const Order = require('../models/orderModel');
const path = require('path');

// Get salesman profile
router.get('/profile', authMiddleware, getSalesmanProfile);

// Serve the orders page
router.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/frontend_for_salesman/salesman_orders.html"));
});

// Get all orders data
router.get('/all-orders', authMiddleware, getSalesmanOrders);

// Get all orders assigned to the logged-in salesman
router.get('/assigned-orders', authMiddleware, getAssignedOrders);

// Pickup an order
router.put('/pickup/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const salesmanId = req.user.id;
        const order = await Order.findById(orderId).populate('salesman');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
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

        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            pickedUp: true,
            pickedUpBy: salesmanId,
            salesman: salesmanId,
            pickedUpAt: new Date(),
            status: newStatus,
            $push: { timeline: timelineEntry }
        }, { new: true }).populate('salesman');
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Drop an order
router.put('/drop/:orderId', authMiddleware, (req, res) => {
    const { orderId } = req.params;
    Order.findByIdAndUpdate(orderId, { pickedUp: false, pickedUpBy: null, pickedUpAt: null }, { new: true })
        .then(order => {
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Pickup order (old endpoint)
router.put('/pickup/:id', authMiddleware, pickupOrder);

// Drop order (old endpoint)
router.put('/drop/:id', authMiddleware, dropOrder);

// Get all salesmen
router.get('/', async (req, res) => {
    try {
        const salesmen = await Salesman.find();
        res.json(salesmen);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
