const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@electroshop.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Password:', existingAdmin.password);
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@electroshop.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@electroshop.com');
    console.log('Password: admin123');
    console.log('\nYou can now login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
