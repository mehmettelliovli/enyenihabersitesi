import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/index';
import { Box } from '@mui/material';
import CategoryNavigation from './components/CategoryNavigation';

// Public pages
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import AdminLogin from './pages/AdminLogin';
import CategoryNews from './pages/CategoryNews';

// Admin pages
import AdminLayout from './components/AdminLayout';
import { Dashboard, NewsManagement, UserManagement } from './pages/admin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Her sayfada görünecek navigation */}
            <CategoryNavigation />
            
            {/* Ana içerik */}
            <Box sx={{ flex: 1 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/category/:categoryId" element={<CategoryNews />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="news" element={<NewsManagement />} />
                  <Route path="users" element={<UserManagement />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
