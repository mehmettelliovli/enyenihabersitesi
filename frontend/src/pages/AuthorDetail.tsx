import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Avatar,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Box,
  Divider,
} from '@mui/material';
import axios from 'axios';

interface Author {
  id: number;
  fullName: string;
  profileImage: string;
  bio: string;
  email: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  viewCount: number;
}

const AuthorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorNews, setAuthorNews] = useState<News[]>([]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const [authorResponse, newsResponse] = await Promise.all([
          axios.get(`http://localhost:3000/users/${id}`),
          axios.get(`http://localhost:3000/news?authorId=${id}`),
        ]);
        setAuthor(authorResponse.data);
        setAuthorNews(newsResponse.data);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    if (id) {
      fetchAuthorData();
    }
  }, [id]);

  if (!author) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Avatar
              src={author.profileImage || 'https://via.placeholder.com/300'}
              alt={author.fullName}
              sx={{ width: '100%', height: 'auto', aspectRatio: '1', mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom>
              {author.fullName}
            </Typography>
            <Typography variant="body1" paragraph>
              {author.bio}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              İletişim: {author.email}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom sx={{ mt: 6 }}>
        Yazarın Haberleri
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {authorNews.map((news) => (
          <Grid item xs={12} sm={6} key={news.id}>
            <Card
              component={RouterLink}
              to={`/news/${news.id}`}
              sx={{ textDecoration: 'none', height: '100%' }}
            >
              <CardMedia
                component="img"
                height="200"
                image={news.imageUrl || 'https://via.placeholder.com/400x200'}
                alt={news.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {news.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {news.content}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Görüntülenme: {news.viewCount}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AuthorDetail; 