const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Validate required env before starting
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Set it in .env and restart.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/social', require('./routes/social'));

// Database connection — start HTTP server only after DB is connected
const PORT = process.env.PORT || 3000;
console.log('Attempting to connect to MongoDB...');
console.log('Using URI:', process.env.MONGODB_URI ? 'MongoDB Atlas (hidden)' : 'localhost');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitcommunity', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});
