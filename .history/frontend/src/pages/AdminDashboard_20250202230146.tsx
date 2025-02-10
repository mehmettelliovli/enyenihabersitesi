import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const response = await axios.get('http://localhost:3000/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
    } catch (error: any) {
      console.error('Error fetching news:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) {
        await checkAuth();
      }
      
      if (isAuthenticated && user) {
        await fetchNews();
      } else if (!isLoading) {
        navigate('/admin/login', { replace: true });
      }
    };

    initializeDashboard();
  }, [isAuthenticated, isLoading, user, checkAuth, fetchNews, navigate]);

  const handleAddNews = () => {
    navigate('/admin/add-news');
  };

  if (isLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Haber Yönetimi
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAddNews}>
          Yeni Haber Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>İçerik</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.content.substring(0, 100)}...</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/admin/edit-news/${item.id}`)}
                  >
                    Düzenle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminDashboard; 