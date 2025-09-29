const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB);
  const email = 'admin@gmail.com';
  const password = 'admin123';
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, password });
    await user.save();
    console.log('Admin user created:', email);
  } else {
    console.log('Admin user already exists:', email);
  }
  mongoose.disconnect();
}

createAdmin();
