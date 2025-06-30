const API_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// Save farmer product to MongoDB only
export const saveProduct = async (product, farmerId, userId) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Authentication required');
    
    let response;
    let method;
    let url;
    
    if (product.id && typeof product.id === 'string' && product.id.length === 24) {
      // Update existing MongoDB product
      method = 'PUT';
      url = `${API_URL}/products/${product.id}`;
    } else {
      // Create new product
      method = 'POST';
      url = `${API_URL}/products`;
    }
    
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        unit: product.unit,
        image: product.image || '/placeholder.jpg',
        description: product.description || ''
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save product to MongoDB');
    }
    
    const savedProduct = await response.json();
    return {
      success: true,
      product: savedProduct,
      storage: 'mongodb'
    };
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    return {
      success: false,
      error: error.message,
      storage: 'mongodb'
    };
  }
};

// Load products from MongoDB only
export const loadProducts = async (farmerId) => {
  try {
    const token = getToken();
    
    if (!token || !farmerId) {
      throw new Error('Authentication required or farmer ID missing');
    }
    
    const response = await fetch(`${API_URL}/products/farmer/${farmerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load products from MongoDB');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};