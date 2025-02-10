import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  viewCount: number;
  author: {
    fullName: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth, logout } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    imageUrl: '',
  });

  const categories = ['Gündem', 'Spor', 'Ekonomi', 'Teknoloji', 'Sağlık', 'Kültür-Sanat'];

  useEffect(() => {
    const init = async () => {
      const isValid = await checkAuth();
      if (!isValid) {
        logout();
        navigate('/admin/login');
        return;
      }
      fetchNews();
    };
    init();
  }, [checkAuth, logout, navigate]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (newsItem?: News) => {
    if (newsItem) {
      setSelectedNews(newsItem);
      setFormData({
        title: newsItem.title,
        content: newsItem.content,
        category: newsItem.category,
        imageUrl: '',
      });
    } else {
      setSelectedNews(null);
      setFormData({
        title: '',
        content: '',
        category: '',
        imageUrl: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNews(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        navigate('/admin/login');
        return;
      }

      if (selectedNews) {
        await axios.put(
          `http://localhost:3000/news/${selectedNews.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post('http://localhost:3000/news', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseDialog();
      fetchNews();
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
      console.error('Error saving news:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          logout();
          navigate('/admin/login');
          return;
        }

        await axios.delete(`http://localhost:3000/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchNews();
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout();
          navigate('/admin/login');
        }
        console.error('Error deleting news:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Haber Yönetimi</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Yeni Haber Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Görüntülenme</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.author.fullName}</TableCell>
                <TableCell>{item.viewCount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNews ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Başlık"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="İçerik"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              margin="normal"
              required
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              select
              label="Kategori"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              margin="normal"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Görsel URL"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 