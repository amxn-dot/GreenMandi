const User = require('../models/userModel');
const Farmer = require('../models/farmerModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is a farmer, get farmer details
    let farmerData = null;
    if (user.userType === 'farmer') {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phone, address, farmName, farmLocation, farmDescription } = req.body;

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();

    // If user is a farmer, update farmer details
    if (user.userType === 'farmer') {
      const farmer = await Farmer.findOne({ user: user._id });

      if (farmer) {
        farmer.farmName = farmName || farmer.farmName;
        farmer.farmLocation = farmLocation || farmer.farmLocation;
        farmer.farmDescription = farmDescription !== undefined ? farmDescription : farmer.farmDescription;

        await farmer.save();
      }
    }

    // If user is a farmer, get updated farmer details
    let farmerData = null;
    if (user.userType === 'farmer') {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only - can be implemented later)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all farmers
// @route   GET /api/users/farmers
// @access  Public
exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({}).populate({
      path: 'user',
      select: 'name email phone'
    });

    const formattedFarmers = farmers.map(farmer => ({
      id: farmer._id,
      userId: farmer.user._id,
      name: farmer.user.name,
      email: farmer.user.email,
      phone: farmer.user.phone,
      farmName: farmer.farmName,
      farmLocation: farmer.farmLocation,
      farmDescription: farmer.farmDescription || 'Local farm providing fresh produce',
      productCount: farmer.products.length
    }));

    res.json(formattedFarmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove this line - it's causing the error
// module.exports = router;