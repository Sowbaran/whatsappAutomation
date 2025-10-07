import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPrinter, 
  FiDownload, 
  FiMail, 
  FiTruck, 
  FiCheckCircle, 
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiDollarSign,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiPackage,
  FiTag,
  FiCalendar,
  FiTruck as FiShipping,
  FiCreditCard as FiPayment,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';

// Mock data - replace with actual API call
const getOrderDetails = (orderId) => {
  // In a real app, this would be an API call
  const orders = [
    {
      id: 'ORD-001',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(123) 456-7890',
        address: '123 Main St, Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States'
      },
      date: '2023-10-05T14:30:00',
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      shippingMethod: 'Express',
      trackingNumber: '1Z999AA1234567890',
      items: [
        {
          id: 1,
          name: 'iPhone 13 Pro',
          sku: 'IP13P-256-SG',
          price: 999.00,
          quantity: 1,
          image: 'https://via.placeholder.com/80',
          subtotal: 999.00
        },
        {
          id: 2,
          name: 'Silicone Case',
          sku: 'SC-IP13P-BLACK',
          price: 49.99,
          quantity: 1,
          image: 'https://via.placeholder.com/80',
          subtotal: 49.99
        },
        {
          id: 3,
          name: 'Screen Protector',
          sku: 'SP-IP13P-2PK',
          price: 19.99,
          quantity: 2,
          image: 'https://via.placeholder.com/80',
          subtotal: 39.98
        }
      ],
      subtotal: 1098.98,
      shipping: 29.99,
      tax: 98.78,
      discount: 0,
      total: 1227.75,
      notes: 'Please deliver after 5 PM.',
      history: [
        {
          id: 1,
          date: '2023-10-05T10:15:00',
          status: 'order_placed',
          description: 'Order placed',
          user: 'Customer'
        },
        {
          id: 2,
          date: '2023-10-05T11:30:00',
          status: 'payment_received',
          description: 'Payment received',
          user: 'System'
        },
        {
          id: 3,
          date: '2023-10-05T12:45:00',
          status: 'processing',
          description: 'Order is being processed',
          user: 'Admin'
        },
        {
          id: 4,
          date: '2023-10-06T09:20:00',
          status: 'shipped',
          description: 'Order has been shipped',
          user: 'Admin',
          trackingNumber: '1Z999AA1234567890'
        },
        {
          id: 5,
          date: '2023-10-07T15:10:00',
          status: 'delivered',
          description: 'Delivered to customer',
          user: 'Courier'
        }
      ]
    },
    // Add more mock orders as needed
  ];

  return orders.find(order => order.id === orderId) || null;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const orderData = getOrderDetails(orderId);
      setOrder(orderData);
      if (orderData) {
        setStatus(orderData.status);
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [orderId]);

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    setOrder(prev => ({
      ...prev,
      status,
      history: [
        ...prev.history,
        {
          id: prev.history.length + 1,
          date: new Date().toISOString(),
          status,
          description: `Status updated to ${status}`,
          user: 'Admin'
        }
      ]
    }));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    // In a real app, this would be an API call
    setOrder(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          id: prev.history.length + 1,
          date: new Date().toISOString(),
          status: 'note',
          description: note,
          user: 'Admin',
          isNote: true
        }
      ]
    }));
    
    setNote('');
  };

  const handleDeleteOrder = () => {
    // In a real app, this would be an API call
    console.log('Deleting order:', orderId);
    navigate('/orders');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'delivered':
        return { 
          icon: <FiCheckCircle className="h-5 w-5" />, 
          color: 'bg-green-100 text-green-800',
          label: 'Delivered'
        };
      case 'shipped':
        return { 
          icon: <FiTruck className="h-5 w-5" />, 
          color: 'bg-blue-100 text-blue-800',
          label: 'Shipped'
        };
      case 'processing':
        return { 
          icon: <FiClock className="h-5 w-5" />, 
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Processing'
        };
      case 'cancelled':
        return { 
          icon: <FiXCircle className="h-5 w-5" />, 
          color: 'bg-red-100 text-red-800',
          label: 'Cancelled'
        };
      case 'pending':
      default:
        return { 
          icon: <FiAlertCircle className="h-5 w-5" />, 
          color: 'bg-gray-100 text-gray-800',
          label: 'Pending'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/orders"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentStatusInfo = order.paymentStatus === 'paid' 
    ? { color: 'bg-green-100 text-green-800', label: 'Paid' }
    : { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link
            to="/orders"
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <span className="mr-1">{statusInfo.icon}</span>
                {statusInfo.label}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                {formatDate(order.date)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiPrinter className="mr-2 h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiMail className="mr-2 h-4 w-4" />
            Email
          </button>
          <Link
            to={`/orders/${order.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiEdit2 className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Order summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Amount
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Customer
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {order.customer.name}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <FiPackage className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Items
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <FiCreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Payment
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                        {paymentStatusInfo.label}
                      </span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'shipping'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shipping & Billing
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md" src={item.image} alt={item.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                          Subtotal
                        </th>
                        <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(order.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                          Shipping
                        </th>
                        <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(order.shipping)}
                        </td>
                      </tr>
                      {order.discount > 0 && (
                        <tr>
                          <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                            Discount
                          </th>
                          <td className="px-6 py-3 text-right text-sm font-medium text-green-600">
                            -{formatCurrency(order.discount)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                          Tax
                        </th>
                        <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(order.tax)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <th scope="row" colSpan="3" className="px-6 py-3 text-right text-base font-bold text-gray-900">
                          Total
                        </th>
                        <td className="px-6 py-3 text-right text-base font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Note</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {order.notes ? (
                      <p className="text-sm text-gray-700">{order.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No customer notes</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div>
                      <select
                        id="status"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Update Status
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="overflow-hidden">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qty
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img className="h-10 w-10 rounded-md" src={item.image} alt={item.name} />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                {formatCurrency(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                      <FiMapPin className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer.address}<br />
                        {order.customer.city}, {order.customer.state} {order.customer.zip}<br />
                        {order.customer.country}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="flex items-center">
                          <FiMail className="mr-2 h-4 w-4" />
                          {order.customer.email}
                        </p>
                        <p className="flex items-center mt-1">
                          <FiUser className="mr-2 h-4 w-4" />
                          {order.customer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Shipping Method</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiTruck className="h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{order.shippingMethod} Shipping</p>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-500">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-gray-400">
                      <FiMapPin className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer.address}<br />
                        {order.customer.city}, {order.customer.state} {order.customer.zip}<br />
                        {order.customer.country}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Payment Method</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {order.paymentMethod}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                            {paymentStatusInfo.label}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.paymentStatus === 'paid' 
                            ? `Paid on ${new Date(order.date).toLocaleDateString()}`
                            : 'Payment pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flow-root">
              <ul className="-mb-8">
                {order.history.map((event, eventIdx) => {
                  let icon;
                  let iconBackground;
                  
                  if (event.status === 'order_placed') {
                    icon = <FiShoppingBag className="h-5 w-5 text-gray-400" />;
                    iconBackground = 'bg-gray-100';
                  } else if (event.status === 'payment_received') {
                    icon = <FiDollarSign className="h-5 w-5 text-green-400" />;
                    iconBackground = 'bg-green-100';
                  } else if (event.status === 'processing') {
                    icon = <FiClock className="h-5 w-5 text-yellow-400" />;
                    iconBackground = 'bg-yellow-100';
                  } else if (event.status === 'shipped') {
                    icon = <FiTruck className="h-5 w-5 text-blue-400" />;
                    iconBackground = 'bg-blue-100';
                  } else if (event.status === 'delivered') {
                    icon = <FiCheckCircle className="h-5 w-5 text-green-400" />;
                    iconBackground = 'bg-green-100';
                  } else if (event.status === 'cancelled') {
                    icon = <FiXCircle className="h-5 w-5 text-red-400" />;
                    iconBackground = 'bg-red-100';
                  } else {
                    icon = <FiTag className="h-5 w-5 text-gray-400" />;
                    iconBackground = 'bg-gray-100';
                  }
                  
                  return (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== order.history.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${iconBackground}`}>
                              {icon}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {event.isNote ? (
                                  <span className="font-medium text-gray-900">Note: </span>
                                ) : (
                                  <span className="font-medium text-gray-900">{event.user}: </span>
                                )}
                                {event.description}
                                {event.trackingNumber && (
                                  <span className="block mt-1 text-xs text-blue-600">
                                    Tracking: {event.trackingNumber}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={event.date}>
                                {formatDate(event.date)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-6">
                <form onSubmit={handleAddNote} className="flex space-x-3">
                  <div className="flex-1">
                    <label htmlFor="note" className="sr-only">Add a note</label>
                    <input
                      type="text"
                      name="note"
                      id="note"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="Add a note to this order..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Note
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-red-700">Danger Zone</h3>
          <div className="mt-2 max-w-xl text-sm text-red-600">
            <p>Once you delete an order, there is no going back. Please be certain.</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete Order
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Order #{order.id}?
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this order? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleDeleteOrder}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
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

export default OrderDetails;
