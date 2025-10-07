import api from './api';

// Get dashboard overview data
export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

// Get sales statistics
export const getSalesStats = async (timeRange = 'monthly') => {
  try {
    const response = await api.get('/dashboard/sales-stats', { 
      params: { range: timeRange } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    throw error;
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await api.get('/dashboard/recent-orders', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Get top products
export const getTopProducts = async (limit = 5) => {
  try {
    const response = await api.get('/dashboard/top-products', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

// Get sales by category
export const getSalesByCategory = async () => {
  try {
    const response = await api.get('/dashboard/sales-by-category');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw error;
  }
};

// Get revenue metrics
export const getRevenueMetrics = async (timeRange = 'monthly') => {
  try {
    const response = await api.get('/dashboard/revenue-metrics', { 
      params: { range: timeRange } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    throw error;
  }
};

// Get customer acquisition metrics
export const getCustomerAcquisition = async (timeRange = 'monthly') => {
  try {
    const response = await api.get('/dashboard/customer-acquisition', { 
      params: { range: timeRange } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer acquisition metrics:', error);
    throw error;
  }
};

// Get sales performance by salesman
export const getSalesPerformance = async (timeRange = 'monthly') => {
  try {
    const response = await api.get('/dashboard/sales-performance', { 
      params: { range: timeRange } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales performance:', error);
    throw error;
  }
};

// Get order status distribution
export const getOrderStatusDistribution = async () => {
  try {
    const response = await api.get('/dashboard/order-status-distribution');
    return response.data;
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    throw error;
  }
};
