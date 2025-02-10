import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/index';
import { Box } from '@mui/material';
import CategoryNavigation from './components/CategoryNavigation';

// Public pages
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import CategoryNews from './pages/CategoryNews';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
