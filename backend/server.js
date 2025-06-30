// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars with absolute path
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to DB function
const connectDB = require('./config/db');

const app = express();

// Middleware
// Increase the payload size limit (50MB in this example)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Create an async function to start the server
const startServer = async () => {
  try {
    // Await the database connection FIRST
    await connectDB();
    console.log('Database connected successfully!');

    // --- CRITICAL: REQUIRE MODELS HERE AFTER DB CONNECTION ---
    // This ensures the models are defined *after* Mongoose has a connection
    // and can properly attach its static methods (create, findOne, etc.)
    require('./models/userModel');
    require('./models/farmerModel');
    require('./models/productModel'); // If you have a product model, ensure it's loaded too

    // --- THEN REQUIRE ROUTES (which will now get fully initialized models) ---
    const authRoutes = require('./routes/authRoutes');
    const productRoutes = require('./routes/productRoutes');
    const userRoutes = require('./routes/userRoutes');

    // Mount the routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);

    // Start listening for requests
    app.listen(PORT, () => {
      console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server:', error.message);
    process.exit(1); // Exit if connection fails
  }
};

// Call the async function to start the server
startServer();
    