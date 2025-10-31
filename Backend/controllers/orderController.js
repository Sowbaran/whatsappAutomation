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
        const key = (req.params.orderId || '').trim();
        let order = await Order.findOne({ orderId: key })
            .populate({ path: 'salesman', model: 'Salesman' });
        // Fallback: if param looks like an ObjectId, try by _id
        if (!order && mongoose.Types.ObjectId.isValid(key)) {
            order = await Order.findById(key).populate({ path: 'salesman', model: 'Salesman' });
        }
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get order by MongoDB _id or by orderId
exports.getOrderByIdOrOrderId = async (req, res) => {
    try {
        const { id } = req.params;
        let order = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id).populate({ path: 'salesman', model: 'Salesman' });
        }
        if (!order) {
            order = await Order.findOne({ orderId: id }).populate({ path: 'salesman', model: 'Salesman' });
        }
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

        // Save the order first
        const savedOrder = await order.save();

        // Create or update customer record
        if (customer && customer.email) {
            try {
                const Customer = require('../models/customerModel');
                await Customer.findOneAndUpdate(
                    { email: customer.email },
                    {
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.shippingAddress || customer.billingAddress,
                        status: customer.status || 'regular'
                    },
                    { upsert: true, new: true }
                );
            } catch (customerErr) {
                console.error('Error creating/updating customer record:', customerErr);
                // Don't fail the order creation if customer creation fails
            }
        }

        res.status(201).json(savedOrder);
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
                // Instead of rejecting, remove salesman field from updateData to prevent reassignment
                delete updateData.salesman;
            }
        }
        // Admin can update any order
        if (updateData.status === 'product packages') updateData.status = 'product packaged';

        // If admin assigns salesman and order not picked up, set status to 'salesman-assigned' if status not already set
        if (updateData.salesman && updateData.salesman !== (order.salesman?.toString() || '') && !order.pickedUp && !updateData.status) {
            updateData.status = 'salesman-assigned';
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
            let extraRemark = '';
            if (updateData.statusChangeReason && updateData.statusChangeReason.trim()) {
                extraRemark = `Reason: ${updateData.statusChangeReason.trim()}`;
            } else if (updateData.statusRemarks && updateData.statusRemarks.trim()) {
                extraRemark = `Remarks: ${updateData.statusRemarks.trim()}`;
            }
            timelineEntries.push({
                action: 'Status Changed',
                description: `Order status changed from '${order.status}' to '${updateData.status}'${extraRemark ? ' | ' + extraRemark : ''}`,
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
            // Find what fields were updated, but exclude auto-calculated fields
            const changedFields = [];
            const excludeFields = ['totalAmount', 'discount', 'shipping', 'tax', 'overallDiscount'];
            for (const key in updateData) {
                if (key === 'statusChangeReason' || key === 'statusRemarks' || key === 'statusChangeDescription') continue;
                if (excludeFields.includes(key)) continue;
                if (key === 'products' && Array.isArray(updateData.products) && Array.isArray(order.products)) {
                    // Compare each product field
                    updateData.products.forEach((prod, idx) => {
                        const oldProd = order.products[idx] || {};
                        for (const prodKey in prod) {
                            if (excludeFields.includes(prodKey)) continue;
                            if (prod[prodKey] !== oldProd[prodKey]) {
                                changedFields.push(prodKey);
                            }
                        }
                    });
                } else if (typeof updateData[key] === 'object' && updateData[key] !== null) {
                    changedFields.push(key);
                } else if (order[key] !== updateData[key]) {
                    changedFields.push(key);
                }
            }
            // Remove duplicates
            const uniqueFields = [...new Set(changedFields)];
            let changesText = uniqueFields.length > 0 ? `Fields updated: ${uniqueFields.join(', ')}` : 'No specific fields changed';
            timelineEntries.push({
                action: 'Order Updated',
                description: `Order ${order.orderId} was updated. ${changesText}`,
                date: new Date(),
                updatedBy: req.user ? req.user.name : 'System'
            });
        }

        const updateObj = {
            $set: updateData,
            $push: { timeline: { $each: timelineEntries } }
        };

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateObj, { new: true }).populate('salesman');

        // If customer information was updated, also update the customer record
        if (updateData.customer && updatedOrder.customer?.email) {
            try {
                const Customer = require('../models/customerModel');
                await Customer.findOneAndUpdate(
                    { email: updatedOrder.customer.email },
                    {
                        name: updatedOrder.customer.name,
                        email: updatedOrder.customer.email,
                        phone: updatedOrder.customer.phone,
                        address: updatedOrder.customer.shippingAddress || updatedOrder.customer.billingAddress,
                        status: updatedOrder.customer.status || 'regular'
                    },
                    { upsert: true, new: true }
                );
            } catch (customerErr) {
                console.error('Error updating customer record:', customerErr);
                // Don't fail the order update if customer update fails
            }
        }

        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Assign orders to salesman
exports.assignOrders = async (req, res) => {
    try {
        const { salesmanId, orderIds } = req.body;

        if (!salesmanId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ error: 'Salesman ID and order IDs are required' });
        }

        // Check if salesman exists
        const Salesman = require('../models/salesmanModel');
        const salesman = await Salesman.findById(salesmanId);
        if (!salesman) {
            return res.status(404).json({ error: 'Salesman not found' });
        }

        // Update orders
        const updatePromises = orderIds.map(orderId => {
            return Order.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        salesman: salesmanId,
                        status: 'salesman-assigned' // Set status if not already
                    },
                    $push: {
                        timeline: {
                            action: 'Order Assigned to Salesman',
                            description: `Order assigned to salesman ${salesman.name}`,
                            date: new Date(),
                            updatedBy: req.user ? req.user.name : 'Admin'
                        }
                    }
                },
                { new: true }
            );
        });

        const updatedOrders = await Promise.all(updatePromises);

        // Check if any orders were not found
        const notFound = updatedOrders.filter(order => !order);
        if (notFound.length > 0) {
            return res.status(404).json({ error: 'Some orders not found' });
        }

        res.json({ message: `${orderIds.length} orders assigned to ${salesman.name}`, updatedOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
