import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (token: string, userData: any) => {
    try {
      // Önce token'ı doğrula
      const verifiedUser = await verifyToken(token);
      if (!verifiedUser) {
        throw new Error('Token verification failed');
      }

      // Token geçerliyse bilgileri kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // State'i güncelle
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      logout();
      throw error; // Hatayı yukarı fırlat
    }
  }, [verifyToken, logout]);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        throw new Error('No token or user found');
      }

      const verifiedUser = await verifyToken(token);
      if (!verifiedUser) {
        throw new Error('Invalid token');
      }

      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [verifyToken, logout]);

  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 