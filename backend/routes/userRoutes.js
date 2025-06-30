const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  updateUserProfile,
  getUserProfile,
  getAllUsers,
  getFarmers
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.get('/farmers', getFarmers);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, getAllUsers);

module.exports = router;