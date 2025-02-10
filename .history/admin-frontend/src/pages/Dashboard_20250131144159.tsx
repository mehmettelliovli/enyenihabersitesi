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
} from '@mui/material';
import axios from 'axios';

interface DashboardStats {
  totalNews: number;
  totalUsers: number;
  recentNews: Array<{
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
  const [stats, setStats] = useState<DashboardStats>({
    totalNews: 0,
    totalUsers: 0,
    recentNews: [],
    topAuthors: [],
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <Container>
      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Toplam Haber Sayısı
            </Typography>
            <Typography variant="h3">{stats.totalNews}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Toplam Kullanıcı Sayısı
            </Typography>
            <Typography variant="h3">{stats.totalUsers}</Typography>
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
                {stats.recentNews.map((news) => (
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