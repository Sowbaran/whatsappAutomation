import React, { useState, useEffect } from 'react';
import { 
  FiFilter, 
  FiSearch, 
  FiDownload, 
  FiChevronDown, 
  FiChevronUp, 
  FiCheck, 
  FiX, 
  FiTruck, 
  FiDollarSign, 
  FiCalendar,
  FiPackage,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

// Mock data - replace with API calls
const orders = [
  {
    id: '#ORD-1001',
    customer: 'John Smith',
    date: '2023-10-05',
    amount: 1250.75,
    status: 'delivered',
    items: 3,
    payment: 'Paid',
    delivery: 'Standard',
    assignedTo: 'You',
    lastUpdated: '2 hours ago'
  },
  {
    id: '#ORD-1002',
    customer: 'Sarah Johnson',
    date: '2023-10-06',
    amount: 899.99,
    status: 'shipped',
    items: 2,
    payment: 'Paid',
    delivery: 'Express',
    assignedTo: 'You',
    lastUpdated: '5 hours ago'
  },
  {
    id: '#ORD-1003',
    customer: 'Michael Brown',
    date: '2023-10-07',
    amount: 2450.50,
    status: 'processing',
    items: 5,
    payment: 'Pending',
    delivery: 'Standard',
    assignedTo: 'You',
    lastUpdated: '1 day ago'
  },
  {
    id: '#ORD-1004',
    customer: 'Emily Davis',
    date: '2023-10-07',
    amount: 599.99,
    status: 'pending',
    items: 1,
    payment: 'Paid',
    delivery: 'Standard',
    assignedTo: 'You',
    lastUpdated: '2 days ago'
  },
  {
    id: '#ORD-1005',
    customer: 'David Wilson',
    date: '2023-10-06',
    amount: 1750.25,
    status: 'cancelled',
    items: 4,
    payment: 'Refunded',
    delivery: 'Express',
    assignedTo: 'You',
    lastUpdated: '3 days ago'
  },
];

const statusStyles = {
  delivered: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusStyles = {
  Paid: 'bg-green-100 text-green-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Refunded: 'bg-red-100 text-red-800',
  Failed: 'bg-gray-100 text-gray-800',
};

const SalesmanOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Toggle filters section
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle date filter change
  const handleDateFilter = (range) => {
    setDateFilter(range);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle select all orders
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Handle select single order
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle delete order
  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  // Confirm delete order
  const confirmDelete = () => {
    // In a real app, you would make an API call here
    console.log('Deleting order:', orderToDelete);
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // Filter and sort orders
  const filteredAndSortedOrders = React.useMemo(() => {
    let result = [...orders];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.payment.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate >= weekAgo && orderDate <= today;
      });
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate >= monthAgo && orderDate <= today;
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [searchTerm, statusFilter, dateFilter, sortConfig]);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="mr-1" />;
      case 'shipped':
        return <FiTruck className="mr-1" />;
      case 'processing':
        return <FiClock className="mr-1" />;
      case 'pending':
        return <FiClock className="mr-1" />;
      case 'cancelled':
        return <FiX className="mr-1" />;
      default:
        return <FiAlertCircle className="mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your assigned orders
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiFilter className="mr-1 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
            {showFilters ? <FiChevronUp className="ml-1 h-4 w-4" /> : <FiChevronDown className="ml-1 h-4 w-4" />}
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => console.log('Export orders')}
          >
            <FiDownload className="mr-1 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Orders
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by order ID, customer..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange('all')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'all' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusChange('pending')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiClock className="mr-1 h-3 w-3" />
                  Pending
                </button>
                <button
                  onClick={() => handleStatusChange('processing')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'processing' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiPackage className="mr-1 h-3 w-3" />
                  Processing
                </button>
                <button
                  onClick={() => handleStatusChange('shipped')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'shipped' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiTruck className="mr-1 h-3 w-3" />
                  Shipped
                </button>
                <button
                  onClick={() => handleStatusChange('delivered')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiCheck className="mr-1 h-3 w-3" />
                  Delivered
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    statusFilter === 'cancelled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <FiX className="mr-1 h-3 w-3" />
                  Cancelled
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  onClick={() => handleDateFilter('all')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                    dateFilter === 'all' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => handleDateFilter('today')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                    dateFilter === 'today' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateFilter('week')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                    dateFilter === 'week' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => handleDateFilter('month')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${
                    dateFilter === 'month' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-700 font-medium">
                {selectedOrders.length} {selectedOrders.length === 1 ? 'order' : 'orders'} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => console.log('Update status for', selectedOrders)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setOrderToDelete(selectedOrders);
                  setShowDeleteModal(true);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Order ID
                    {sortConfig.key === 'id' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortConfig.key === 'customer' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{order.id}</div>
                      <div className="text-xs text-gray-500">{order.lastUpdated}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FiUser className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                          <div className="text-xs text-gray-500">{order.delivery} Delivery</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items} items</div>
                      <div className="text-xs text-gray-500">{order.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status]}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusStyles[order.payment] || 'bg-gray-100 text-gray-800'}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <div>
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            id="options-menu"
                            aria-expanded="true"
                            aria-haspopup="true"
                          >
                            <span className="sr-only">Open options</span>
                            <FiMoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <div className="py-1" role="none">
                            <a
                              href={`/orders/${order.id}`}
                              className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                              role="menuitem"
                            >
                              <FiEye className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                              View Details
                            </a>
                            <a
                              href={`/orders/${order.id}/edit`}
                              className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                              role="menuitem"
                            >
                              <FiEdit2 className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                              Edit Order
                            </a>
                            <button
                              onClick={() => handleDeleteClick(order.id)}
                              className="w-full text-left text-red-600 group flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                              role="menuitem"
                            >
                              <FiTrash2 className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                              Delete Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedOrders.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredAndSortedOrders.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredAndSortedOrders.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first 2 pages, last 2 pages, and current page with neighbors
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1; // First 5 pages
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i; // Last 5 pages
                    } else {
                      // Middle pages (current page in the middle)
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-green-50 border-green-500 text-green-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowDeleteModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete {Array.isArray(orderToDelete) ? `${orderToDelete.length} selected orders` : 'order'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {Array.isArray(orderToDelete) ? 'the selected orders' : 'this order'}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmanOrders;
