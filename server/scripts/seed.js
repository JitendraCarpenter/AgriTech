require('dotenv').config();
const mongoose = require('mongoose'), { User, Resource } = require('../models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (!(await User.findOne({ email: process.env.ADMIN_EMAIL })))
    await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
  if (!(await Resource.countDocuments()))
    await Resource.insertMany([
      { name: 'Wheat seed (HD-2967), 10 kg', category: 'seed', price: 450, stock: 200 },
      { name: 'Urea, 50 kg bag', category: 'fertilizer', price: 270, stock: 500 },
      { name: 'DAP, 50 kg bag', category: 'fertilizer', price: 1350, stock: 300 },
      { name: 'Neem oil, 1 L', category: 'pesticide', price: 380, stock: 120 },
      { name: 'Hand sprayer, 16 L', category: 'tool', price: 1200, stock: 60 },
    ]);
  console.log('Seeded.'); process.exit(0);
})();
