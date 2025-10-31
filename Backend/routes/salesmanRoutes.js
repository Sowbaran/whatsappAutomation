const express = require('express');
const router = express.Router();
const { getSalesmanProfile, getSalesmanOrders, getAssignedOrders, pickupOrder, dropOrder, createSalesman, updateSalesman, getOrderById } = require('../controllers/salesmanController');
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

// Get a single order by ID or orderId
router.get('/orders/:id', authMiddleware, getOrderById);

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

// Get a specific salesman by ID (including password hash)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { getSalesmanById } = require('../controllers/salesmanController');
    return getSalesmanById(req, res);
});

// Get all salesmen
router.get('/', async (req, res) => {
    try {
        const salesmen = await Salesman.find();
        
        // Calculate activeOrders and totalSales for each salesman
        const salesmenWithStats = await Promise.all(salesmen.map(async (salesman) => {
            // Count active orders (not completed, not cancelled)
            const activeOrders = await Order.countDocuments({
                salesman: salesman._id,
                status: { $nin: ['completed', 'cancelled', 'canceled'] }
            });
            
            // Calculate total sales from completed orders
            const completedOrders = await Order.find({
                salesman: salesman._id,
                status: { $in: ['completed', 'delivered'] }
            });
            const totalSales = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
            return {
                _id: salesman._id,
                name: salesman.name,
                email: salesman.email,
                phone: salesman.phone,
                region: salesman.region,
                activeOrders,
                totalSales
            };
        }));
        
        res.json(salesmenWithStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create salesman
router.post('/', authMiddleware, createSalesman);

// Update salesman
router.patch('/:id', authMiddleware, updateSalesman);

module.exports = router;
