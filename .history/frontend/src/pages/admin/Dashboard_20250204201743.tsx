import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Article as ArticleIcon,
  People as PeopleIcon,
  Visibility as ViewsIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

interface DashboardStats {
  newsCount: number;
  userCount: number;
  totalViews: number;
  topAuthors: Array<{
    id: number;
    fullName: string;
    newsCount: number;
  }>;
  latestNews: Array<{
    id: number;
    title: string;
    createdAt: string;
    viewCount: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('İstatistikler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <ArticleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.newsCount}</Typography>
            <Typography variant="subtitle1">Toplam Haber</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.userCount}</Typography>
            <Typography variant="subtitle1">Kullanıcı</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <ViewsIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.totalViews}</Typography>
            <Typography variant="subtitle1">Toplam Görüntülenme</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <TrendingIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4">{stats.latestNews.length}</Typography>
            <Typography variant="subtitle1">Yeni Haber</Typography>
          </Paper>
        </Grid>

        {/* Son Eklenen Haberler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Son Eklenen Haberler
            </Typography>
            {stats.latestNews.map((news) => (
              <Box
                key={news.id}
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography variant="subtitle1">{news.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(news.createdAt).toLocaleDateString('tr-TR')} - {news.viewCount} görüntülenme
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* En Aktif Yazarlar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              En Aktif Yazarlar
            </Typography>
            {stats.topAuthors.map((author) => (
              <Box
                key={author.id}
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Typography variant="subtitle1">{author.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {author.newsCount} haber
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 