const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        shippingAddress: { type: String },
        billingAddress: { type: String },
        status: { type: String, default: 'regular' }
    },
    products: [
        {
            product: { type: String, required: true },
            sku: { type: String },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
            discount: { type: Number, default: 0 }
        }
    ],
    totalAmount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'Salesman' },
    pickedUp: { type: Boolean, default: false },
    pickedUpBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Salesman' },
    pickedUpAt: { type: Date },
    payment: {
        method: { type: String },
        status: { type: String, default: 'unpaid' },
        transactionId: { type: String },
        date: { type: Date },
        amountPaid: { type: Number },
        cardEnding: { type: String }
    },
    timeline: [
        {
            action: { type: String, required: true },
            description: { type: String },
            date: { type: Date, default: Date.now },
            updatedBy: { type: String }
        }
    ],
    customerNotes: { type: String },
    specialInstructions: { type: String },
    giftMessage: { type: String },
    internalNotes: { type: String },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);