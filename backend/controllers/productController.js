const Product = require('../models/productModel');
const Farmer = require('../models/farmerModel');
const User = require('../models/userModel'); // Make sure this User model is also correctly defined

// @desc    Get all products
// @route   GET /api/products
// @access  Public
async function getProducts(req, res) {
  try {
    const { category } = req.query;
    let query = { listed: true }; // <--- Only listed products are fetched
    if (category && category !== 'all') query.category = category;

    // It's good practice to populate farmer and user to get related data
    const products = await Product.find(query).populate({
      path: 'farmer', // Populates the 'farmer' field (which refers to Farmer profile)
      select: 'farmName',
      populate: { path: 'user', select: 'name' } // Populates the 'user' field within the Farmer profile
    });

    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description || `Fresh ${p.name.toLowerCase()} from our farm.`,
      price: p.price,
      unit: p.unit,
      image: p.image,
      category: p.category,
      // Ensure these exist if you're populating farmer
      farmerId: p.farmer ? p.farmer._id : null, // Farmer profile ID
      farmerName: p.farmer && p.farmer.farmName ? p.farmer.farmName : 'N/A',
      // If you need the user's name (Aman Sarthi) associated with the farm, you'd get it like:
      // userName: p.farmer && p.farmer.user && p.farmer.user.name ? p.farmer.user.name : 'N/A',
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in getProducts:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
}

// @desc    Get farmer's products
// @route   GET /api/products/farmer/:farmerId
// @access  Public
async function getFarmerProducts(req, res) {
  try {
    const { farmerId } = req.params; // This `farmerId` is actually the userId (from frontend's userData._id)

    // *** FIX APPLIED HERE ***
    // Query by the 'user' field in the Product model, as this is where the User's _id is stored.
    const products = await Product.find({ user: farmerId });

    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description || `Fresh ${p.name.toLowerCase()} from our farm.`,
      price: p.price,
      unit: p.unit,
      image: p.image,
      category: p.category,
      stock: p.stock,
      listed: p.listed
    }));

    // If no products are found, return an empty array, not a 404
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error in getFarmerProducts:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to fetch farmer products', error: error.message });
  }
}

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Farmers only)
async function createProduct(req, res) {
  try {
    const { name, category, stock, price, unit, image, description } = req.body;

    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can create products' });
    }

    const farmer = await Farmer.findOne({ user: req.user.id }); // Finds the Farmer profile document
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const product = await Product.create({
      name,
      category,
      stock,
      price,
      unit,
      image: image || '/placeholder.jpg',
      description: description || '',
      listed: true, // You had this set to true, keeping it that way
      farmer: farmer._id, // References the Farmer profile ID
      user: req.user.id // References the User (authentication) ID
    });

    // Make sure 'products' array exists on the Farmer model if you're pushing to it
    if (!farmer.products) {
        farmer.products = [];
    }
    farmer.products.push(product._id);
    await farmer.save();

    res.status(201).json({
      id: product._id,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      unit: product.unit,
      image: product.image,
      description: product.description,
      listed: product.listed
    });
  } catch (error) {
    console.error('Error in createProduct:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
}

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Product owner only)
async function updateProduct(req, res) {
  try {
    // Only allow updating fields present in the request body for safety
    const updateFields = {};
    const { name, category, stock, price, unit, image, description, listed } = req.body;
    if (name !== undefined) updateFields.name = name;
    if (category !== undefined) updateFields.category = category;
    if (stock !== undefined) updateFields.stock = stock;
    if (price !== undefined) updateFields.price = price;
    if (unit !== undefined) updateFields.unit = unit;
    if (image !== undefined) updateFields.image = image;
    if (description !== undefined) updateFields.description = description;
    // 'listed' can be updated via this route too, or keep it separate as updateProductListing
    // If you always want to use updateProductListing for 'listed', remove this:
    if (listed !== undefined) updateFields.listed = listed;


    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Check if the user trying to update is the owner of the product
    if (product.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update the product using findByIdAndUpdate for atomicity and direct return of updated doc
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields }, // Use $set to update only provided fields
      { new: true, runValidators: true } // Return the new document, run schema validators
    );

    res.json({
      id: updatedProduct._id,
      name: updatedProduct.name,
      category: updatedProduct.category,
      stock: updatedProduct.stock,
      price: updatedProduct.price,
      unit: updatedProduct.unit,
      image: updatedProduct.image,
      description: updatedProduct.description,
      listed: updatedProduct.listed
    });
  } catch (error) {
    console.error('Error in updateProduct:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
}

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Product owner only)
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Pull the product ID from the farmer's products array
    await Farmer.updateOne(
      { user: req.user.id }, // Find the farmer by their associated user ID
      { $pull: { products: product._id } }
    );

    await Product.deleteOne({ _id: product._id }); // Use deleteOne for clarity

    res.status(200).json({ message: 'Product removed successfully' }); // Send a 200 OK
  } catch (error) {
    console.error('Error in deleteProduct:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
}

// @desc    Update product listing status
// @route   PUT /api/products/:id/listing
// @access  Private (Farmers only)
async function updateProductListing(req, res) {
  try {
    const { id } = req.params;
    const { listed } = req.body; // Expecting 'true' or 'false'

    // Validate 'listed' is a boolean
    if (typeof listed !== 'boolean') {
        return res.status(400).json({ message: 'The "listed" field must be a boolean (true or false).' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure only the farmer who owns the product can update its listing status
    if (product.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product listing' });
    }

    product.listed = listed;
    await product.save();

    res.status(200).json({ message: 'Product listing status updated', product: {
        id: product._id,
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        unit: product.unit,
        image: product.image,
        description: product.description,
        listed: product.listed
    } }); // Return relevant product info
  } catch (error) {
    console.error('Error in updateProductListing:', error); // Add more specific logging
    res.status(500).json({ message: 'Failed to update product listing', error: error.message });
  }
}

module.exports = {
  getProducts,
  getFarmerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductListing,
};