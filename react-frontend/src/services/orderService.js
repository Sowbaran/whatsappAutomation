import api from './api';

// Get all orders with optional filters
export const getOrders = async (filters = {}) => {
  try {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update an existing order
export const updateOrder = async (orderId, updateData) => {
  try {
    const response = await api.put(`/orders/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

// Get orders by salesman ID
export const getOrdersBySalesman = async (salesmanId, filters = {}) => {
  try {
    const response = await api.get(`/salesmen/${salesmanId}/orders`, { params: filters });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for salesman ${salesmanId}:`, error);
    throw error;
  }
};

// Get sales statistics
export const getSalesStats = async (timeRange = 'monthly') => {
  try {
    const response = await api.get('/dashboard/sales-stats', { params: { range: timeRange } });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    throw error;
  }
};
