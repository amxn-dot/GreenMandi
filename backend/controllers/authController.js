// controllers/authController.js

const mongoose = require('mongoose'); // Still need this to access mongoose.models
const jwt = require('jsonwebtoken');

// Helper to get models from Mongoose's cache
// This is safer as models are guaranteed to be registered after DB connection
const getUserModel = () => mongoose.models.User || mongoose.model('User');
const getFarmerModel = () => mongoose.models.Farmer || mongoose.model('Farmer');


// Generate JWT (RESTORED THIS FUNCTION)
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT configuration error');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password, phone, address, userType, farmName, farmLocation, farmDescription } = req.body;

    const User = getUserModel(); // Get User model
    // Check if user exists
    console.log('Attempting to find user with email:', email);
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

// Create user
console.log('Creating new user with data:', { name, email, userType });
const user = await User.create({
  name,
  email,
  password,
  phone,
  address,
  userType,
});
console.log('User created successfully:', user._id);

// If user is a farmer, create farmer profile
    if (userType === 'farmer') {
        const Farmer = getFarmerModel(); // Get Farmer model
        // No need for the explicit check here anymore, as `getFarmerModel` will throw if not found
      await Farmer.create({
        user: user._id,
        farmName,
        farmLocation,
        farmDescription,
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        userType: user.userType,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error.stack);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt received for:', req.body.email);
    const { email, password, userType } = req.body;

    const User = getUserModel(); // Get User model
    // Check for user email
    console.log('Finding user by email and userType:', email, userType);
    const user = await User.findOne({ email, userType }).select('+password');

    if (!user) {
      console.log('User not found or userType mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid credentials (user not found)' });
    }

// Check if password matches
console.log('User found, attempting password match...');
console.log('Entered password:', password);
console.log('Stored password hash:', user.password);
const isMatch = await user.matchPassword(password);

if (!isMatch) {
  console.log('Password mismatch for user:', email);
  return res.status(401).json({ message: 'Invalid credentials (password mismatch)' });
}

  // If user is a farmer, get farmer details
    let farmerData = null;
    if (user.userType === 'farmer') {
        const Farmer = getFarmerModel(); // Get Farmer model
      console.log('User is farmer, attempting to find farmer details for user ID:', user._id);
      farmerData = await Farmer.findOne({ user: user._id });
      if (!farmerData) {
        console.warn('WARNING: Farmer profile not found for user ID:', user._id);
      }
    }

    console.log('Login successful for user:', email);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      ...(farmerData && {
        farmName: farmerData.farmName,
        farmLocation: farmerData.farmLocation,
        farmDescription: farmerData.farmDescription,
      }),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const User = getUserModel(); // Get User model
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a farmer, get farmer details
    let farmerData = null;
    if (user.userType === 'farmer') {
        const Farmer = getFarmerModel(); // Get Farmer model
      farmerData = await Farmer.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      ...(farmerData && {
        farmName: farmerData.farmName,
        farmLocation: farmerData.farmLocation,
        farmDescription: farmerData.farmDescription,
      }),
    });
  } catch (error) {
    console.error('GetMe error:', error.stack);
    res.status(500).json({ message: error.message });
  }
};
