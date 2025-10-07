import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        if (authenticated) {
          const userData = getCurrentUser();
          setUser(userData);
          setIsAuth(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    setIsAuth(true);
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      setIsAuth(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AppContext.Provider value={{ user, isAuth, loading, login, logout, setUser }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
