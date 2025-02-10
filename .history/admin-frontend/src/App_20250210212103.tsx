import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewsManagement from './pages/NewsManagement';
import CategoryManagement from './pages/CategoryManagement';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles.some(role => role.name === 'SUPER_ADMIN');
  return isSuperAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
}

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="news" element={<NewsManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route
                path="users"
                element={
                  <SuperAdminRoute>
                    <UserManagement />
                  </SuperAdminRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 