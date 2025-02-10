import { useState, useEffect } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  viewCount: number;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    fullName: string;
  };
  createdAt: string;
}

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [newsResponse, categoriesResponse] = await Promise.all([
        axios.get('http://localhost:3000/news', { headers }),
        axios.get('http://localhost:3000/categories', { headers }),
      ]);

      setNews(newsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (newsItem?: News) => {
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
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
      };

      if (editingNews) {
        await axios.put(
          `http://localhost:3000/news/${editingNews.id}`,
          submitData,
          { headers }
        );
      } else {
        await axios.post('http://localhost:3000/news', submitData, { headers });
      }

      await fetchData();
      handleClose();
    } catch (err) {
      console.error('Haber kaydetme hatası:', err);
      setError(err instanceof Error ? err.message : 'Haber kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      await axios.delete(`http://localhost:3000/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();
    } catch (err) {
      console.error('Haber silme hatası:', err);
      setError(err instanceof Error ? err.message : 'Haber silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>Görüntülenme</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>Resim</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.category?.name || 'Kategori Yok'}</TableCell>
                <TableCell>{item.author?.fullName || 'Yazar Yok'}</TableCell>
                <TableCell>{item.viewCount}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
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
                  <IconButton onClick={() => handleOpen(item)} color="primary">
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNews ? 'Haberi Düzenle' : 'Yeni Haber'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Başlık"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.categoryId}
                label="Kategori"
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Resim URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="İçerik"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              margin="normal"
              required
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 