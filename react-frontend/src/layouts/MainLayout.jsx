import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiUsers, FiShoppingBag, FiTruck, FiBarChart2, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children, isSalesman = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isSalesman
    ? [
        { to: '/salesman/orders', icon: <FiShoppingBag />, label: 'My Orders' },
        { to: '/salesman/profile', icon: <FiUser />, label: 'Profile' },
      ]
    : [
        { to: '/', icon: <FiHome />, label: 'Dashboard' },
        { to: '/customers', icon: <FiUsers />, label: 'Customers' },
        { to: '/orders', icon: <FiShoppingBag />, label: 'Orders' },
        { to: '/products', icon: <FiTruck />, label: 'Products' },
        { to: '/sales-progress', icon: <FiBarChart2 />, label: 'Sales Progress' },
      ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-green-600 text-white">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Electro Shop</span>
            </Link>
            <button 
              className="lg:hidden p-2 rounded-md text-white hover:bg-green-700"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <FiUser className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.to)
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-lg font-medium text-gray-900">
                {navItems.find(item => isActive(item.to))?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                <FiSettings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
