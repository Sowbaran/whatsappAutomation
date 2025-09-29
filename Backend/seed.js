const mongoose = require('mongoose');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
const Customer = require('./models/customerModel');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/whatsappAutomation';

async function seed() {
    await mongoose.connect(MONGO_URI);
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});

    // Seed Products
    const products = await Product.insertMany([
        { name: 'Phone', description: 'Smartphone', price: 299, stock: 50 },
        { name: 'Charger', description: 'Fast charger', price: 29, stock: 100 },
        { name: 'Earphones', description: 'Wireless', price: 49, stock: 80 },
        { name: 'Case', description: 'Protective case', price: 19, stock: 120 },
        { name: 'Screen Guard', description: 'Tempered glass', price: 15, stock: 90 },
        { name: 'Bluetooth Speaker', description: 'Portable', price: 59, stock: 40 },
        { name: 'Power Bank', description: '10000mAh', price: 39, stock: 60 },
        { name: 'Smart Watch', description: 'Fitness tracker', price: 99, stock: 30 },
        { name: 'USB Cable', description: 'Type-C', price: 10, stock: 200 },
        { name: 'SIM Adapter', description: 'Multi-size', price: 5, stock: 150 }
    ]);

    // Seed Customers
    const customers = await Customer.insertMany([
        { name: 'Alice', email: 'alice@example.com', phone: '1234567890', address: '123 Main St' },
        { name: 'Bob', email: 'bob@example.com', phone: '2345678901', address: '456 Oak St' },
        { name: 'Charlie', email: 'charlie@example.com', phone: '3456789012', address: '789 Pine St' },
        { name: 'David', email: 'david@example.com', phone: '4567890123', address: '321 Maple St' },
        { name: 'Eva', email: 'eva@example.com', phone: '5678901234', address: '654 Elm St' },
        { name: 'Frank', email: 'frank@example.com', phone: '6789012345', address: '987 Cedar St' },
        { name: 'Grace', email: 'grace@example.com', phone: '7890123456', address: '159 Spruce St' },
        { name: 'Helen', email: 'helen@example.com', phone: '8901234567', address: '753 Birch St' },
        { name: 'Ian', email: 'ian@example.com', phone: '9012345678', address: '852 Walnut St' },
        { name: 'Jane', email: 'jane@example.com', phone: '0123456789', address: '951 Chestnut St' },
        { name: 'Sowbaran', email: 'sowbaran@example.com', phone: '0123456789', address: '951 Chestnut St' }
    ]);

    // Seed Orders
    const orders = [];
    for (let i = 0; i < 12; i++) {
        const cust = customers[i % customers.length];
        const prod = products[i % products.length];
        orders.push({
            orderId: `ORD${1000 + i}`,
            customer: {
                name: cust.name,
                email: cust.email,
                phone: cust.phone,
                shippingAddress: cust.address,
                billingAddress: cust.address,
                status: 'regular'
            },
            products: [{
                product: prod.name,
                sku: `SKU${1000 + i}`,
                price: prod.price,
                quantity: 1
            }],
            totalAmount: prod.price,
            status: i % 2 === 0 ? 'pending' : 'completed',
            payment: {
                method: 'credit',
                status: i % 2 === 0 ? 'unpaid' : 'paid',
                transactionId: `TXN${1000 + i}`,
                date: new Date(),
                amountPaid: prod.price,
                cardEnding: '1234'
            },
            timeline: [{
                action: 'Order Created',
                description: 'Order was placed',
                date: new Date(),
                updatedBy: 'System'
            }],
            customerNotes: `Notes for order ${i}`,
            specialInstructions: `Special instructions ${i}`,
            giftMessage: i % 3 === 0 ? `Gift message ${i}` : '',
            internalNotes: `Internal notes ${i}`
        });
    }
    await Order.insertMany(orders);

    console.log('Seed data inserted!');
    mongoose.disconnect();
}

seed();
