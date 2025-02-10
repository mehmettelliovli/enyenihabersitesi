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
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import required modules
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

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
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [mostViewedNews, setMostViewedNews] = useState<News[]>([]);
  const [randomNews, setRandomNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [latestResponse, mostViewedResponse, allNewsResponse] = await Promise.all([
        axios.get('http://localhost:3000/news/latest?limit=5'),
        axios.get('http://localhost:3000/news/most-viewed?limit=5'),
        axios.get('http://localhost:3000/news')
      ]);

      setLatestNews(latestResponse.data);
      setMostViewedNews(mostViewedResponse.data);
      
      // Rastgele 6 haber seç
      const shuffled = allNewsResponse.data.sort(() => 0.5 - Math.random());
      setRandomNews(shuffled.slice(0, 6));
      
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
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Sol taraf - Slider */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>
            Son Eklenen Haberler
          </Typography>
          <Paper elevation={3}>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              style={{ borderRadius: '4px', height: '400px' }}
            >
              {latestNews.map((news) => (
                <SwiperSlide key={news.id}>
                  <Box sx={{ position: 'relative', height: '100%' }}>
                    <CardMedia
                      component="img"
                      image={news.imageUrl}
                      alt={news.title}
                      sx={{ height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: 2,
                      }}
                    >
                      <Typography variant="h6">{news.title}</Typography>
                      <Typography variant="body2">
                        {news.content.substring(0, 100)}...
                      </Typography>
                      <Typography variant="caption">
                        {news.category.name} | {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Paper>
        </Grid>

        {/* Sağ taraf - En çok okunanlar */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" gutterBottom>
            En Çok Okunanlar
          </Typography>
          <Paper elevation={3}>
            <List>
              {mostViewedNews.map((news, index) => (
                <div key={news.id}>
                  <ListItem>
                    <Box sx={{ mr: 2, minWidth: '24px' }}>
                      <Typography variant="h6" color="primary">
                        {index + 1}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={news.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VisibilityIcon fontSize="small" />
                          <Typography variant="caption">
                            {news.viewCount} görüntülenme
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mostViewedNews.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Alt kısım - Rastgele Haberler */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Diğer Haberler
          </Typography>
          <Grid container spacing={3}>
            {randomNews.map((news) => (
              <Grid item xs={12} sm={6} md={4} key={news.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={news.imageUrl}
                    alt={news.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {news.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {news.category.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
} 