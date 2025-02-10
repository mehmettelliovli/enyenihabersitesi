import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface DashboardStats {
  newsCount: number;
  userCount: number;
  latestNews: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
  topAuthors: Array<{
    id: number;
    fullName: string;
    newsCount: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Oturum bulunamadı');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:3000/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('İstatistikler yüklenirken bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>Veri bulunamadı</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Toplam Haber Sayısı
            </Typography>
            <Typography variant="h3">{stats.newsCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Toplam Kullanıcı Sayısı
            </Typography>
            <Typography variant="h3">{stats.userCount}</Typography>
          </Paper>
        </Grid>

        {/* Son Eklenen Haberler */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son Eklenen Haberler
              </Typography>
              <List>
                {stats.latestNews.map((news) => (
                  <React.Fragment key={news.id}>
                    <ListItem>
                      <ListItemText
                        primary={news.title}
                        secondary={new Date(news.createdAt).toLocaleDateString('tr-TR')}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* En Aktif Yazarlar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                En Aktif Yazarlar
              </Typography>
              <List>
                {stats.topAuthors.map((author) => (
                  <React.Fragment key={author.id}>
                    <ListItem>
                      <ListItemText
                        primary={author.fullName}
                        secondary={`${author.newsCount} haber`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 