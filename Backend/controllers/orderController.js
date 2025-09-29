const Order = require('../models/orderModel');
const mongoose = require('mongoose');

exports.getAllOrders = async (req, res) => {
    try {
        // No populate for products.product, just get plain text
        const orders = await Order.find()
            .populate({ path: 'salesman', model: 'Salesman' });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderByOrderId = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate({ path: 'salesman', model: 'Salesman' });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get order by MongoDB _id
exports.getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ error: 'Invalid order ID format' });
        }
        const order = await Order.findById(req.params.id)
            .populate({ path: 'salesman', model: 'Salesman' });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
    let { products, customer, orderId, status, salesman, payment, customerNotes, specialInstructions, giftMessage, internalNotes } = req.body;
    if (status === 'product packages') status = 'product packaged';
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Order must have at least one product.' });
        }
        if (!customer || !customer.name) {
            return res.status(400).json({ error: 'Customer name is required.' });
        }
        // Calculate totalAmount from products (price * quantity)
        let totalAmount = 0;
        products.forEach(p => {
            if (!p.product || !p.price || !p.quantity) {
                throw new Error('Each product must have product name, price, and quantity.');
            }
            totalAmount += p.price * p.quantity;
        });
        const order = new Order({
            orderId,
            customer,
            products,
            totalAmount,
            status,
            salesman, // assign salesman ObjectId
            payment,
            customerNotes,
            specialInstructions,
            giftMessage,
            internalNotes,
            timeline: [{
                action: 'Order Created',
                description: `Order ${orderId} created for customer ${customer.name}`,
                date: new Date(),
                updatedBy: 'E-commerce System'
            }]
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('salesman');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        let updateData = req.body;
        const timelineEntries = [];

        // Check permissions
        if (req.user && req.user.role === 'salesman') {
            // Salesman can update status of any order, but cannot reassign
            if (updateData.salesman && updateData.salesman !== (order.salesman?.toString() || '')) {
                return res.status(403).json({ error: 'You cannot reassign orders' });
            }
        }
        // Admin can update any order
        if (updateData.status === 'product packages') updateData.status = 'product packaged';

        // If admin assigns salesman and order not picked up, set status to 'salesman assigned' if status not already set
        if (updateData.salesman && updateData.salesman !== (order.salesman?.toString() || '') && !order.pickedUp && !updateData.status) {
            updateData.status = 'salesman assigned';
        }

        // Check if salesman is being assigned
        if (updateData.salesman && updateData.salesman !== (order.salesman?.toString() || '')) {
            const salesman = await require('../models/salesmanModel').findById(updateData.salesman);
            timelineEntries.push({
                action: 'Order Assigned to Salesman',
                description: `Order assigned to salesman ${salesman ? salesman.name : 'Unknown'}`,
                date: new Date(),
                updatedBy: req.user ? req.user.name : 'System'
            });
        }

        // Check if status is changing
        if (updateData.status && updateData.status !== order.status) {
            timelineEntries.push({
                action: 'Status Changed',
                description: `Order status changed from '${order.status}' to '${updateData.status}'`,
                date: new Date(),
                updatedBy: req.user ? req.user.name : 'System'
            });
        }

        // Recalculate totalAmount if products are updated
        if (updateData.products) {
            let totalAmount = 0;
            updateData.products.forEach(p => {
                totalAmount += p.price * p.quantity;
            });
            updateData.totalAmount = totalAmount;
        }

        // Add general timeline entry for update if no specific entries
        if (timelineEntries.length === 0) {
            timelineEntries.push({
                action: 'Order Updated',
                description: `Order ${order.orderId} was updated`,
                date: new Date(),
                updatedBy: req.user ? req.user.name : 'System'
            });
        }

        const updateObj = {
            $set: updateData,
            $push: { timeline: { $each: timelineEntries } }
        };

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObj, { new: true }).populate('salesman');
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
