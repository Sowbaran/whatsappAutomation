const config = {
  // API Configuration
  api: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000, // 10 seconds
    withCredentials: true,
  },
  
  // Authentication
  auth: {
    tokenKey: 'auth_token',
    userKey: 'user_data',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  
  // Routes
  routes: {
    login: '/login',
    logout: '/logout',
    dashboard: '/',
    customers: '/customers',
    orders: '/orders',
    products: '/products',
    salesProgress: '/sales-progress',
    // Salesman routes
    salesman: {
      login: '/salesman/login',
      orders: '/salesman/orders',
      profile: '/salesman/profile',
    },
  },
  
  // Default pagination settings
  pagination: {
    pageSize: 10,
    pageSizes: [5, 10, 20, 50, 100],
  },
  
  // Date & Time formats
  dateTime: {
    shortDate: 'MM/DD/YYYY',
    longDate: 'MMMM D, YYYY',
    dateTime: 'MM/DD/YYYY hh:mm A',
    time: 'hh:mm A',
  },
  
  // Form validation
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: {
      minLength: 6,
    },
    phone: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
  },
  
  // UI Configuration
  ui: {
    theme: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      dangerColor: '#EF4444',
      infoColor: '#3B82F6',
      lightColor: '#F9FAFB',
      darkColor: '#1F2937',
    },
    toast: {
      position: 'top-right',
      duration: 5000,
    },
  },
};

export default config;
