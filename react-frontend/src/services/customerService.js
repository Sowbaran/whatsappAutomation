import api from './api';

// Get all customers with optional filters
export const getCustomers = async (filters = {}) => {
  try {
    const response = await api.get('/customers', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Get a single customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw error;
  }
};

// Create a new customer
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Update an existing customer
export const updateCustomer = async (customerId, updateData) => {
  try {
    const response = await api.put(`/customers/${customerId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer ${customerId}:`, error);
    throw error;
  }
};

// Delete a customer
export const deleteCustomer = async (customerId) => {
  try {
    const response = await api.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting customer ${customerId}:`, error);
    throw error;
  }
};

// Get customer orders
export const getCustomerOrders = async (customerId, filters = {}) => {
  try {
    const response = await api.get(`/customers/${customerId}/orders`, { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    throw error;
  }
};

// Search customers
export const searchCustomers = async (query, filters = {}) => {
  try {
    const response = await api.get('/customers/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

// Get customer statistics
export const getCustomerStats = async () => {
  try {
    const response = await api.get('/customers/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    throw error;
  }
};
