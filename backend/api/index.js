const app = require('../src/app');
const { connectDB } = require('../src/config/database');

// Connect to database if not already connected (Vercel serverless environment)
connectDB();

module.exports = app;
