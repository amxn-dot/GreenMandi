import api from './api';

export const productService = {
  getAllProducts: async (category?: string) => {
    const response = await api.get('/products', {
      params: { category }
    });
    return response.data;
  },
  
  getFarmerProducts: async (farmerId: string) => {
    const response = await api.get(`/products/farmer/${farmerId}`);
    return response.data;
  },
  
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  updateProductListing: async (id: string, listed: boolean) => {
    const response = await api.put(`/products/${id}/listing`, { listed });
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};