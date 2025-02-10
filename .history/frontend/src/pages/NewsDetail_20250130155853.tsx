import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  Chip,
} from '@mui/material';
import axios from 'axios';

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  viewCount: number;
  tags: string[];
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    profileImage: string;
    bio: string;
  };
}

const NewsDetail = () => {
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

    if (id) {
      fetchNews();
    }
  }, [id]);

  if (!news) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          {news.title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Chip label={news.category} color="primary" sx={{ mr: 1 }} />
          {news.tags.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined" sx={{ mr: 1 }} />
          ))}
        </Box>

        {news.imageUrl && (
          <Box sx={{ mb: 4 }}>
            <img
              src={news.imageUrl}
              alt={news.title}
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
          {news.content}
        </Typography>

        <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={news.author.profileImage}
                alt={news.author.fullName}
                sx={{ width: 64, height: 64 }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">{news.author.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {news.author.bio}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Görüntülenme: {news.viewCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(news.createdAt).toLocaleDateString('tr-TR')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewsDetail; 