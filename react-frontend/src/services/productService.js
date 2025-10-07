import api from './api';

// Get all products with optional filters
export const getProducts = async (filters = {}) => {
  try {
    const response = await api.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.keys(productData).forEach(key => {
      if (key === 'images' && Array.isArray(productData[key])) {
        // Handle multiple images
        productData[key].forEach((file, index) => {
          formData.append('images', file);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (productId, updateData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to form data
    Object.keys(updateData).forEach(key => {
      if (key === 'images' && Array.isArray(updateData[key])) {
        // Handle multiple images
        updateData[key].forEach((file, index) => {
          if (file instanceof File) {
            formData.append('newImages', file);
          } else {
            // This is an existing image URL/path
            formData.append('existingImages', file);
          }
        });
      } else if (updateData[key] !== undefined && updateData[key] !== null) {
        formData.append(key, updateData[key]);
      }
    });
    
    const response = await api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }
};

// Update product stock
export const updateProductStock = async (productId, quantity) => {
  try {
    const response = await api.patch(`/products/${productId}/stock`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
};

// Get product categories
export const getProductCategories = async () => {
  try {
    const response = await api.get('/products/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId, filters = {}) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`, { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Search products
export const searchProducts = async (query, filters = {}) => {
  try {
    const response = await api.get('/products/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};
