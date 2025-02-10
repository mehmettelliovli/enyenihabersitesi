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
  Card,
  CardMedia,
  CardContent,
  Grid,
  Pagination,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
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
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    imageUrl: '',
  });
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Add filter states
  const [filters, setFilters] = useState({
    title: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  // Add filter effect
  useEffect(() => {
    applyFilters();
  }, [news, filters]);

  const applyFilters = () => {
    let result = [...news];

    // Filter by title
    if (filters.title) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // Filter by category
    if (filters.categoryId) {
      result = result.filter(item => 
        item.category.id.toString() === filters.categoryId
      );
    }

    // Filter by date range
    if (filters.startDate) {
      result = result.filter(item => 
        new Date(item.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      result = result.filter(item => 
        new Date(item.createdAt) <= new Date(filters.endDate)
      );
    }

    setFilteredNews(result);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/admin/login');
      } else {
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetailOpen = async (newsItem: News) => {
    try {
      setDetailLoading(true);
      setSelectedNews(newsItem);
      setDetailOpen(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`http://localhost:3000/news/${newsItem.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSelectedNews(response.data);
    } catch (err) {
      console.error('Haber detayı yüklenirken hata:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/admin/login');
      } else {
        setError(err instanceof Error ? err.message : 'Haber detayı yüklenirken bir hata oluştu');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedNews(null);
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
        navigate('/admin/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
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
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Bu işlem için yetkiniz bulunmamaktadır. Lütfen ADMIN veya AUTHOR rolüne sahip bir kullanıcı ile giriş yapın.');
        } else {
          setError(err.response?.data?.message || 'Haber kaydedilirken bir hata oluştu');
        }
      } else {
        setError('Haber kaydedilirken bir hata oluştu');
      }
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
        navigate('/admin/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(`http://localhost:3000/news/${id}`, { headers });
      await fetchData();
    } catch (err) {
      console.error('Haber silme hatası:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Bu işlem için yetkiniz bulunmamaktadır. Lütfen ADMIN veya AUTHOR rolüne sahip bir kullanıcı ile giriş yapın.');
        } else {
          setError(err.response?.data?.message || 'Haber silinirken bir hata oluştu');
        }
      } else {
        setError('Haber silinirken bir hata oluştu');
      }
    }
  };

  // Add pagination calculation
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Calculate pagination
  const paginatedNews = filteredNews.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const pageCount = Math.ceil(filteredNews.length / rowsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

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

        {/* Add Filter Section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Başlık Ara"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filters.categoryId}
                  label="Kategori"
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Başlangıç Tarihi"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Bitiş Tarihi"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>
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
            {paginatedNews.map((item) => (
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
                  <IconButton onClick={() => handleDetailOpen(item)} color="info">
                    <VisibilityIcon />
                  </IconButton>
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

      {/* Add Pagination */}
      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            showFirstButton 
            showLastButton
          />
        </Stack>
      </Box>

      {/* Haber Detay Dialog */}
      <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Haber Detayı
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : selectedNews ? (
            <Card>
              {selectedNews.imageUrl && (
                <CardMedia
                  component="img"
                  height="300"
                  image={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedNews.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Kategori: {selectedNews.category.name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Yazar: {selectedNews.author.fullName}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedNews.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Görüntülenme: {selectedNews.viewCount} | 
                  Tarih: {new Date(selectedNews.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Typography>Haber bulunamadı</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Haber Ekleme/Düzenleme Dialog */}
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