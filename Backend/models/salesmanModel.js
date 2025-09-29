const mongoose = require('mongoose');

const salesmanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password:{type:String,required:true},
    region: { type: String },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Salesman', salesmanSchema);