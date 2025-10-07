import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers, 
  FiTrendingUp, 
  FiFilter, 
  FiDownload, 
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - replace with actual API calls
const salesData = {
  daily: [
    { date: 'Mon', sales: 12, revenue: 1250, orders: 12 },
    { date: 'Tue', sales: 19, revenue: 1850, orders: 19 },
    { date: 'Wed', sales: 15, revenue: 1520, orders: 15 },
    { date: 'Thu', sales: 28, revenue: 2450, orders: 28 },
    { date: 'Fri', sales: 22, revenue: 1980, orders: 22 },
    { date: 'Sat', sales: 14, revenue: 1350, orders: 14 },
    { date: 'Sun', sales: 8, revenue: 850, orders: 8 },
  ],
  monthly: [
    { month: 'Jan', sales: 320, revenue: 28500, orders: 320 },
    { month: 'Feb', sales: 290, revenue: 26400, orders: 290 },
    { month: 'Mar', sales: 380, revenue: 32500, orders: 380 },
    { month: 'Apr', sales: 350, revenue: 29800, orders: 350 },
    { month: 'May', sales: 410, revenue: 35600, orders: 410 },
    { month: 'Jun', sales: 390, revenue: 34200, orders: 390 },
    { month: 'Jul', sales: 420, revenue: 36800, orders: 420 },
    { month: 'Aug', sales: 450, revenue: 39500, orders: 450 },
    { month: 'Sep', sales: 430, revenue: 37800, orders: 430 },
    { month: 'Oct', sales: 480, revenue: 42500, orders: 480 },
    { month: 'Nov', sales: 520, revenue: 46800, orders: 520 },
    { month: 'Dec', sales: 680, revenue: 59500, orders: 680 },
  ],
  yearly: [
    { year: '2019', sales: 3850, revenue: 325000, orders: 3850 },
    { year: '2020', sales: 4250, revenue: 368000, orders: 4250 },
    { year: '2021', sales: 4980, revenue: 452000, orders: 4980 },
    { year: '2022', sales: 5120, revenue: 486000, orders: 5120 },
    { year: '2023', sales: 5800, revenue: 525000, orders: 5800 },
  ]
};

const topProducts = [
  { id: 1, name: 'iPhone 13 Pro', category: 'Smartphones', sales: 1250, revenue: 1248750, quantity: 1250 },
  { id: 2, name: 'MacBook Pro 14"', category: 'Laptops', sales: 980, revenue: 1959020, quantity: 980 },
  { id: 3, name: 'AirPods Pro', category: 'Audio', sales: 2350, revenue: 585150, quantity: 2350 },
  { id: 4, name: 'Apple Watch Series 7', category: 'Wearables', sales: 1560, revenue: 622440, quantity: 1560 },
  { id: 5, name: 'iPad Air', category: 'Tablets', sales: 890, revenue: 533110, quantity: 890 },
];

const topCategories = [
  { name: 'Smartphones', sales: 3250, revenue: 3247500 },
  { name: 'Laptops', sales: 2450, revenue: 4895100 },
  { name: 'Audio', sales: 3850, revenue: 958650 },
  { name: 'Wearables', sales: 2150, revenue: 857850 },
  { name: 'Tablets', sales: 1850, revenue: 1108150 },
  { name: 'Accessories', sales: 4250, revenue: 425000 },
];

const salesReps = [
  { id: 1, name: 'John Smith', sales: 1250, revenue: 1250000, target: 1500000, progress: 83 },
  { id: 2, name: 'Sarah Johnson', sales: 1180, revenue: 1180000, target: 1200000, progress: 98 },
  { id: 3, name: 'Michael Brown', sales: 980, revenue: 980000, target: 1000000, progress: 98 },
  { id: 4, name: 'Emily Davis', sales: 870, revenue: 870000, target: 900000, progress: 97 },
  { id: 5, name: 'David Wilson', sales: 520, revenue: 520000, target: 800000, progress: 65 },
];

const SalesProgress = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState('line');

  // Toggle filters section
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowFilters(false);
    }, 1000);
  };

  // Reset filters
  const resetFilters = () => {
    setTimeRange('monthly');
    setDateRange({
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

  // Get current data based on time range
  const getCurrentData = () => {
    return salesData[timeRange] || [];
  };

  // Calculate summary stats
  const calculateSummary = () => {
    const data = getCurrentData();
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const avgOrderValue = totalRevenue / totalOrders || 0;
    
    // Calculate change from previous period
    let change = 0;
    if (data.length > 1) {
      const prevPeriod = data[data.length - 2];
      const currentPeriod = data[data.length - 1];
      change = ((currentPeriod.revenue - prevPeriod.revenue) / prevPeriod.revenue) * 100;
    }
    
    return {
      totalSales,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      change: isFinite(change) ? change : 0
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    const data = getCurrentData();
    const labels = data.map(item => item[timeRange === 'daily' ? 'date' : timeRange === 'monthly' ? 'month' : 'year']);
    const salesData = data.map(item => item.sales);
    const revenueData = data.map(item => item.revenue);
    
    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: salesData,
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Prepare pie chart data for categories
  const prepareCategoryData = () => {
    return {
      labels: topCategories.map(cat => cat.name),
      datasets: [
        {
          data: topCategories.map(cat => cat.revenue),
          backgroundColor: [
            'rgba(79, 70, 229, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(20, 184, 166, 0.8)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: `Sales & Revenue (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Revenue')) {
                label += formatCurrency(context.parsed.y);
              } else {
                label += formatNumber(context.parsed.y);
              }
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales (units)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Revenue by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  const summary = calculateSummary();
  const chartData = prepareChartData();
  const categoryData = prepareCategoryData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Progress</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and analyze your sales performance
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
            onClick={resetFilters}
          >
            <FiRefreshCw className="mr-1 h-4 w-4" />
            Reset
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => console.log('Export data')}
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
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                id="timeRange"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {timeRange === 'custom' && (
              <>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="start"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    value={dateRange.start}
                    onChange={handleDateChange}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="end"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    value={dateRange.end}
                    onChange={handleDateChange}
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isLoading}
              >
                {isLoading ? 'Applying...' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(summary.totalRevenue)}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${summary.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.change >= 0 ? (
                          <FiTrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <FiTrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {summary.change >= 0 ? 'Increased' : 'Decreased'} by
                        </span>
                        {Math.abs(summary.change).toFixed(1)}%
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                View all revenue
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <FiShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(summary.totalOrders)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                View all orders
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <FiUsers className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg. Order Value
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(summary.avgOrderValue)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                View customer insights
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <FiTrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Conversion Rate
                  </dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {summary.totalSales > 0 ? ((summary.totalOrders / summary.totalSales) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                View performance
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBarChart2 className="inline-block mr-2 h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiPackage className="inline-block mr-2 h-4 w-4" />
              Top Products
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiPieChart className="inline-block mr-2 h-4 w-4" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab('reps')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reps'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUsers className="inline-block mr-2 h-4 w-4" />
              Sales Reps
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Sales & Revenue</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setChartType('line')}
                      className={`p-1 rounded ${chartType === 'line' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                      title="Line Chart"
                    >
                      <FiActivity className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`p-1 rounded ${chartType === 'bar' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                      title="Bar Chart"
                    >
                      <FiBarChart2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="h-80">
                  {chartType === 'line' ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <Bar data={chartData} options={chartOptions} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <tr key={item} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              #ORD-{1000 + item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Customer {item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {formatCurrency(500 + (item * 100))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 font-medium">{index + 1}</span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {product.category}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.revenue / product.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(product.quantity)} sold
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md" src={product.image} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatNumber(product.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(product.revenue / product.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
                  <div className="h-96">
                    <Pie data={categoryData} options={pieOptions} />
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
                  <div className="space-y-4">
                    {topCategories.map((category, index) => {
                      const totalRevenue = topCategories.reduce((sum, cat) => sum + cat.revenue, 0);
                      const percentage = (category.revenue / totalRevenue) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900">{category.name}</span>
                            <span className="text-gray-900">{formatCurrency(category.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{category.sales} sales</span>
                            <span>{percentage.toFixed(1)}% of total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reps' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales Representative
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesReps.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {rep.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{rep.name}</div>
                            <div className="text-sm text-gray-500">
                              {rep.sales} sales
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatNumber(rep.sales)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                        {formatCurrency(rep.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(rep.target)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${rep.progress >= 90 ? 'bg-green-600' : rep.progress >= 70 ? 'bg-blue-600' : 'bg-yellow-500'}`}
                              style={{ width: `${Math.min(rep.progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            {rep.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesProgress;
