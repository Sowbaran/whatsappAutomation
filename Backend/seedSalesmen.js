// Seed 10 salesman data
const mongoose = require('mongoose');
const Salesman = require('./models/salesmanModel');

const MONGO_URI = process.env.MONGODB || 'mongodb://localhost:27017/whatsappAutomation';

const salesmen = [
  { name: 'Amit Kumar', email: 'amit.kumar@sales.com', phone: '9876543210', password:"password123",region: 'North' },
  { name: 'Priya Singh', email: 'priya.singh@sales.com', phone: '9876543211', password:"password123", region: 'South' },
  { name: 'Rahul Sharma', email: 'rahul.sharma@sales.com', phone: '9876543212',password:"password123", region: 'East' },
  { name: 'Sneha Patel', email: 'sneha.patel@sales.com', phone: '9876543213',password:"password123", region: 'West' },
  { name: 'Vikram Rao', email: 'vikram.rao@sales.com', phone: '9876543214',password:"password123", region: 'Central' },
  { name: 'Anjali Mehta', email: 'anjali.mehta@sales.com', phone: '9876543215',password:"password123", region: 'North' },
  { name: 'Rohit Verma', email: 'rohit.verma@sales.com', phone: '9876543216',password:"password123", region: 'South' },
  { name: 'Kavita Joshi', email: 'kavita.joshi@sales.com', phone: '9876543217', password:"password123",region: 'East' },
  { name: 'Deepak Gupta', email: 'deepak.gupta@sales.com', phone: '9876543218',password:"password123", region: 'West' },
  { name: 'Meera Nair', email: 'meera.nair@sales.com', phone: '9876543219', password:"password123",region: 'Central' }
];

async function seedSalesmen() {
  await mongoose.connect(MONGO_URI);
  await Salesman.deleteMany({});
  await Salesman.insertMany(salesmen);
  console.log('Seeded 10 salesman records');
  mongoose.disconnect();
}

seedSalesmen().catch(err => {
  console.error('Error seeding salesmen:', err);
  mongoose.disconnect();
});
