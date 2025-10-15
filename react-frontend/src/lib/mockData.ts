export const mockOrders = [
  {
    id: 'ORD-001',
    customer: { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
    date: '2025-01-10',
    total: 1299.99,
    status: 'completed' as const,
    items: [
      { id: 1, name: 'iPhone 14 Pro', sku: 'SKU1001', quantity: 1, price: 999.99, discount: 0 },
      { id: 2, name: 'AirPods Pro', sku: 'SKU1002', quantity: 1, price: 299.99, discount: 0 },
    ],
    shipping: 24.99,
    tax: 104.00,
    overallDiscount: 50.00,
    salesman: 'Mike Johnson',
    payment: { method: 'Credit Card', status: 'Paid', transactionId: 'TXN-12345' },
    history: [
      { date: '2025-01-10 09:00', status: 'Order Placed', note: 'Order received via WhatsApp' },
      { date: '2025-01-10 10:30', status: 'Processing', note: 'Payment confirmed' },
      { date: '2025-01-10 14:00', status: 'Shipped', note: 'Out for delivery' },
      { date: '2025-01-11 16:00', status: 'Completed', note: 'Delivered successfully' },
    ],
  },
  {
    id: 'ORD-002',
    customer: { name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1234567891' },
    date: '2025-01-11',
    total: 2499.99,
    status: 'processing' as const,
    items: [
      { id: 3, name: 'MacBook Air M2', sku: 'SKU1003', quantity: 1, price: 1199.99, discount: 50.00 },
      { id: 4, name: 'Magic Mouse', sku: 'SKU1004', quantity: 1, price: 99.99, discount: 0 },
      { id: 5, name: 'USB-C Cable', sku: 'SKU1005', quantity: 2, price: 19.99, discount: 0 },
    ],
    shipping: 35.00,
    tax: 180.00,
    overallDiscount: 100.00,
    salesman: 'Tom Wilson',
    payment: { method: 'PayPal', status: 'Paid', transactionId: 'TXN-12346' },
    history: [
      { date: '2025-01-11 11:00', status: 'Order Placed', note: 'Order received' },
      { date: '2025-01-11 12:00', status: 'Processing', note: 'Items being prepared' },
    ],
  },
  {
    id: 'ORD-003',
    customer: { name: 'Alex Brown', email: 'alex@example.com', phone: '+1234567892' },
    date: '2025-01-12',
    total: 899.99,
    status: 'pending' as const,
    items: [
      { id: 6, name: 'iPad Pro 11"', sku: 'SKU1006', quantity: 1, price: 899.99, discount: 0 },
    ],
    shipping: 15.00,
    tax: 72.00,
    overallDiscount: 0,
    salesman: null,
    payment: { method: 'Bank Transfer', status: 'Pending', transactionId: 'TXN-12347' },
    history: [
      { date: '2025-01-12 09:30', status: 'Order Placed', note: 'Awaiting payment confirmation' },
    ],
  },
];

export const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', orders: 5, totalSpent: 5499.95, joinedDate: '2024-06-15' },
  { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1234567891', orders: 3, totalSpent: 3299.97, joinedDate: '2024-08-20' },
  { id: 3, name: 'Alex Brown', email: 'alex@example.com', phone: '+1234567892', orders: 1, totalSpent: 899.99, joinedDate: '2025-01-05' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567893', orders: 7, totalSpent: 8799.93, joinedDate: '2024-03-10' },
  { id: 5, name: 'Michael Wilson', email: 'michael@example.com', phone: '+1234567894', orders: 2, totalSpent: 1599.98, joinedDate: '2024-11-22' },
];

export const mockProducts = [
  { id: 1, name: 'iPhone 14 Pro', category: 'Smartphones', price: 999.99, stock: 45, image: '/placeholder.svg', status: 'active' as const },
  { id: 2, name: 'AirPods Pro', category: 'Audio', price: 299.99, stock: 120, image: '/placeholder.svg', status: 'active' as const },
  { id: 3, name: 'MacBook Air M2', category: 'Laptops', price: 1199.99, stock: 28, image: '/placeholder.svg', status: 'active' as const },
  { id: 4, name: 'Magic Mouse', category: 'Accessories', price: 99.99, stock: 80, image: '/placeholder.svg', status: 'active' as const },
  { id: 5, name: 'USB-C Cable', category: 'Accessories', price: 19.99, stock: 200, image: '/placeholder.svg', status: 'active' as const },
  { id: 6, name: 'iPad Pro 11"', category: 'Tablets', price: 899.99, stock: 35, image: '/placeholder.svg', status: 'active' as const },
];

export const mockSalesmen = [
  { id: 1, name: 'Mike Johnson', email: 'mike@shop.com', activeOrders: 5, totalSales: 12500, avatar: '/placeholder.svg' },
  { id: 2, name: 'Tom Wilson', email: 'tom@shop.com', activeOrders: 3, totalSales: 8900, avatar: '/placeholder.svg' },
  { id: 3, name: 'Lisa Anderson', email: 'lisa@shop.com', activeOrders: 0, totalSales: 15600, avatar: '/placeholder.svg' },
  { id: 4, name: 'David Martinez', email: 'david@shop.com', activeOrders: 0, totalSales: 9200, avatar: '/placeholder.svg' },
];
