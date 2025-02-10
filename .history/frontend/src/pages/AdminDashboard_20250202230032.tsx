import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await checkAuth();
        if (!isAuthenticated) {
          navigate('/admin/login', { replace: true });
          return;
        }
        await fetchNews();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        navigate('/admin/login', { replace: true });
      }
    };

    initializeDashboard();
  }, [isAuthenticated, navigate]);

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/admin/login', { replace: true });
      }
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

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