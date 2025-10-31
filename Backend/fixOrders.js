// Script to fix existing orders by adding products from the products collection
// Usage: node fixOrders.js

const mongoose = require('mongoose');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');

const MONGO_URI = process.env.MONGODB || 'mongodb://localhost:27017/yourdbname';

async function fixOrders() {
    await mongoose.connect(MONGO_URI);
    const products = await Product.find();
    if (products.length === 0) {
        console.log('No products found in the database.');
        return;
    }
    const orders = await Order.find();
    for (const order of orders) {
        // If products array is empty, add one or more products
        if (!order.products || order.products.length === 0) {
            // Add first product with quantity 1
            order.products = [{ product: products[0]._id, quantity: 1 }];
            // Optionally add more products
            // order.products.push({ product: products[1]._id, quantity: 2 });
            // Recalculate totalAmount
            order.totalAmount = products[0].price * 1;
            await order.save();
            console.log(`Fixed order ${order.orderId} with product ${products[0].name}`);
        }
    }
    mongoose.disconnect();
    console.log('Order fixing complete.');
}

fixOrders().catch(err => {
    console.error('Error fixing orders:', err);
    mongoose.disconnect();
});
