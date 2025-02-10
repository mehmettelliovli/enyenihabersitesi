import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
  author: {
    fullName: string;
  };
  createdAt: string;
}

export default function NewsManagement() {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    imageUrl: '',
  });

  const checkAndRefreshToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token not found, redirecting to login');
      navigate('/login');
      return null;
    }
    return token;
  };

  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      console.log('Unauthorized, redirecting to login');
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setError(error.response?.data?.message || 'Bir hata oluştu');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = checkAndRefreshToken();
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [newsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:3000/news', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/categories', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('News data:', newsResponse.data);
        console.log('Categories data:', categoriesResponse.data);

        setNews(newsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleOpen = (newsItem?: News) => {
    const token = checkAndRefreshToken();
    if (!token) return;

    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        content: newsItem.content,
        categoryId: newsItem.category.id.toString(),
        imageUrl: newsItem.imageUrl || '',
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        content: '',
        categoryId: '',
        imageUrl: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      categoryId: '',
      imageUrl: '',
    });
  };

  const handleSubmit = async () => {
    const token = checkAndRefreshToken();
    if (!token) return;

    try {
      setError(null);

      if (!formData.title || !formData.content || !formData.categoryId) {
        setError('Lütfen zorunlu alanları doldurun');
        return;
      }

      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
      };

      if (editingNews) {
        await axios.put(
          `http://localhost:3000/news/${editingNews.id}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post('http://localhost:3000/news', submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const response = await axios.get('http://localhost:3000/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data);
      handleClose();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = checkAndRefreshToken();
    if (!token) return;

    if (window.confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      try {
        setError(null);
        await axios.delete(`http://localhost:3000/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get('http://localhost:3000/news', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(response.data);
      } catch (error) {
        handleApiError(error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Haber Yönetimi
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Yeni Haber
          </Button>
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Resim</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Henüz haber bulunmamaktadır
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.author.fullName}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNews ? 'Haberi Düzenle' : 'Yeni Haber'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Başlık"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={formData.categoryId}
              label="Kategori"
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Resim URL"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            label="İçerik"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
} 