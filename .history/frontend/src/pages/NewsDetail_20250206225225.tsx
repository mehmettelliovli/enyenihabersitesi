import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import axios from 'axios';
import RecentNewsSidebar from '../components/RecentNewsSidebar';
import CategoryNavigation from '../components/CategoryNavigation';

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category: {
    name: string;
  };
  author: {
    fullName: string;
  };
  createdAt: string;
  viewCount: number;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/news/${id}`);
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, [id]);

  if (!news) {
    return (
      <>
        <CategoryNavigation />
        <Container>
          <Typography>Yükleniyor...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <CategoryNavigation />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Ana içerik */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {/* Başlık */}
              <Typography variant="h4" gutterBottom>
                {news.title}
              </Typography>

              {/* Meta Bilgileri */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  avatar={<Avatar>{news.author.fullName[0]}</Avatar>}
                  label={news.author.fullName}
                />
                <Chip label={news.category.name} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {news.viewCount} görüntülenme
                </Typography>
              </Box>

              {/* Resim */}
              {news.imageUrl && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    style={{
                      width: '100%',
                      maxHeight: '500px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* İçerik */}
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {news.content}
              </Typography>
            </Paper>
          </Grid>

          {/* Sağ sidebar - Son Eklenen Haberler */}
          <Grid item xs={12} md={4}>
            <RecentNewsSidebar />
          </Grid>
        </Grid>
      </Container>
    </>
  );
} 