import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiDollarSign, 
  FiShoppingBag, 
  FiTruck,
  FiStar,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSettings,
  FiLock,
  FiBell,
  FiHelpCircle
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - replace with API calls
const profileData = {
  personalInfo: {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, Anytown, USA',
    joinDate: '2022-03-15',
    position: 'Senior Sales Executive',
    department: 'Sales',
    manager: 'Sarah Johnson',
    employeeId: 'EMP-2022-015',
  },
  performance: {
    monthlySales: 12450,
    monthlyTarget: 15000,
    monthlyOrders: 45,
    averageOrderValue: 276.67,
    conversionRate: 32.5,
    customerSatisfaction: 4.7,
    ytdSales: 142500,
    ytdTarget: 180000,
  },
  recentActivities: [
    { id: 1, type: 'order', title: 'New order received', description: 'Order #ORD-1042 from Jane Doe', time: '2 hours ago', icon: 'shopping' },
    { id: 2, type: 'customer', title: 'New customer added', description: 'Michael Brown created new account', time: '5 hours ago', icon: 'user' },
    { id: 3, type: 'payment', title: 'Payment received', description: 'Payment for order #ORD-1038', amount: 1250.75, time: '1 day ago', icon: 'dollar' },
    { id: 4, type: 'shipment', title: 'Order shipped', description: 'Order #ORD-1035 has been shipped', time: '2 days ago', icon: 'truck' },
    { id: 5, type: 'rating', title: 'New rating received', description: '5-star rating from Emily Wilson', time: '3 days ago', icon: 'star' },
  ],
  salesData: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [8500, 9200, 10200, 11200, 12500, 13200, 14200, 13800, 14500, 15200, 14800, 16200],
    target: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
  },
  customerSatisfaction: {
    satisfied: 78,
    neutral: 15,
    dissatisfied: 7,
  },
};

const SalesmanProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData.personalInfo });
  const [activeTab, setActiveTab] = useState('overview');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Save profile changes
  const handleSaveProfile = () => {
    // In a real app, you would make an API call here to update the profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  // Change password
  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    // In a real app, you would make an API call here to change the password
    console.log('Changing password:', passwordData);
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // Calculate performance metrics
  const performance = profileData.performance;
  const monthlyProgress = (performance.monthlySales / performance.monthlyTarget) * 100;
  const ytdProgress = (performance.ytdSales / performance.ytdTarget) * 100;

  // Prepare chart data
  const salesChartData = {
    labels: profileData.salesData.labels,
    datasets: [
      {
        label: 'Monthly Sales',
        data: profileData.salesData.values,
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Monthly Target',
        data: profileData.salesData.target,
        borderColor: 'rgba(16, 185, 129, 1)',
        borderDash: [5, 5],
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const satisfactionData = {
    labels: ['Satisfied', 'Neutral', 'Dissatisfied'],
    datasets: [
      {
        data: [
          profileData.customerSatisfaction.satisfied,
          profileData.customerSatisfaction.neutral,
          profileData.customerSatisfaction.dissatisfied,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const satisfactionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  // Get icon component based on activity type
  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case 'shopping':
        return <FiShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <FiUser className="h-5 w-5 text-green-500" />;
      case 'dollar':
        return <FiDollarSign className="h-5 w-5 text-yellow-500" />;
      case 'truck':
        return <FiTruck className="h-5 w-5 text-indigo-500" />;
      case 'star':
        return <FiStar className="h-5 w-5 text-amber-400" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account settings
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiSave className="mr-2 h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ ...profileData.personalInfo });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiX className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiEdit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Log
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'overview' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col items-center">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <FiUser className="h-12 w-12 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{formData.name}</h3>
                      <p className="text-sm text-gray-500">{formData.position}</p>
                      <p className="mt-2 text-sm text-gray-500">{formData.department} Department</p>
                      <p className="text-sm text-gray-500">Employee ID: {formData.employeeId}</p>
                      
                      <div className="mt-6 w-full">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            {formData.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiPhone className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            {formData.phone}
                          </div>
                          <div className="flex items-start text-sm text-gray-500">
                            <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                            {formData.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            Joined {new Date(formData.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiUser className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            Manager: {formData.manager}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                    
                    <div className="space-y-4">
                      <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                              <span>Monthly Target</span>
                              <span>
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(performance.monthlySales)} / {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(performance.monthlyTarget)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {monthlyProgress.toFixed(1)}% of target
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                              <span>YTD Target</span>
                              <span>
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(performance.ytdSales)} / {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(performance.ytdTarget)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(ytdProgress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {ytdProgress.toFixed(1)}% of annual target
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-gray-900">{performance.monthlyOrders}</div>
                              <div className="text-xs text-gray-500">Orders This Month</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(performance.averageOrderValue)}
                              </div>
                              <div className="text-xs text-gray-500">Avg. Order Value</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {performance.conversionRate}%
                              </div>
                              <div className="text-xs text-gray-500">Conversion Rate</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center">
                                <FiStar className="h-5 w-5 text-yellow-400 mr-1" />
                                <span className="text-2xl font-bold text-gray-900">
                                  {performance.customerSatisfaction}
                                </span>
                                <span className="text-gray-500 text-sm ml-1">/5</span>
                              </div>
                              <div className="text-xs text-gray-500">Customer Rating</div>
                            </div>
                          </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Charts and Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sales Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales Performance</h3>
                  <div className="h-80">
                    <Line data={salesChartData} options={chartOptions} />
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Satisfaction</h3>
                    <div className="h-64">
                      <Doughnut data={satisfactionData} options={satisfactionOptions} />
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {profileData.recentActivities.map((activity, activityIdx) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {activityIdx !== profileData.recentActivities.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                                    {getActivityIcon(activity.icon)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-800">
                                      {activity.title}{' '}
                                      <span className="font-medium text-gray-900">{activity.description}</span>
                                    </p>
                                    {activity.amount && (
                                      <p className="text-sm text-gray-500">
                                        {new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: 'USD',
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(activity.amount)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={activity.time}>{activity.time}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8 divide-y divide-gray-200">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formData.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{formData.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="pt-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                </div>

                {showChangePassword ? (
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Save New Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(true)}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="pt-8">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage how you receive notifications.
                  </p>
                </div>

                <div className="mt-6">
                  <fieldset>
                    <legend className="sr-only">Notification preferences</legend>
                    <div className="space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="email-notifications"
                            name="email-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-notifications" className="font-medium text-gray-700">
                            Email notifications
                          </label>
                          <p className="text-gray-500">Get notified about important account updates.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="sms-notifications"
                            name="sms-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="sms-notifications" className="font-medium text-gray-700">
                            SMS notifications
                          </label>
                          <p className="text-gray-500">Get notified about important updates via SMS.</p>
                        </div>
                      </div>
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="marketing-emails"
                            name="marketing-emails"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="marketing-emails" className="font-medium text-gray-700">
                            Marketing emails
                          </label>
                          <p className="text-gray-500">Receive our newsletter and promotional offers.</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  A log of all your recent activities and system events.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Filter by date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <select
                      id="activity-filter"
                      name="activity-filter"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      defaultValue="30days"
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="90days">Last 90 days</option>
                      <option value="year">This year</option>
                      <option value="all">All time</option>
                    </select>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:px-6">
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {profileData.recentActivities.map((activity) => (
                        <li key={activity.id}>
                          <div className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-sm font-medium text-green-600">{activity.title}</p>
                                <div className="ml-2 flex flex-shrink-0">
                                  <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                    {activity.type}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    {activity.icon === 'dollar' ? (
                                      <FiDollarSign className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    ) : activity.icon === 'truck' ? (
                                      <FiTruck className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    ) : activity.icon === 'star' ? (
                                      <FiStar className="mr-1.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                    ) : activity.icon === 'user' ? (
                                      <FiUser className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    ) : (
                                      <FiShoppingBag className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    )}
                                    {activity.description}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <FiClock className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                  <p>
                                    <time dateTime={activity.time}>{activity.time}</time>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    View All Activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesmanProfile;
