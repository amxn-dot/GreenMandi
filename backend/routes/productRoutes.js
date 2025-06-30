const express = require('express');
const { 
  getProducts, 
  getFarmerProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateProductListing 
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/farmer/:farmerId', getFarmerProducts);

// Protected routes (require authentication)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/listing', protect, updateProductListing);

module.exports = router;