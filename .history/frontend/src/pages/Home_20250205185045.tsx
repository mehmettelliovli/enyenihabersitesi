import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

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

export default function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/news');
      setNews(response.data);
    } catch (err) {
      console.error('Haberler yüklenirken hata:', err);
      setError('Haberler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Son Haberler
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {news.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.content.length > 150
                    ? `${item.content.substring(0, 150)}...`
                    : item.content}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Kategori: {item.category.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Yazar: {item.author.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Görüntülenme: {item.viewCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Tarih: {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 