import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category: string;
  viewCount: number;
  author: {
    fullName: string;
  };
}

// Mock data
const mockNews: News[] = [
  {
    id: 1,
    title: "Yapay Zeka Teknolojisinde Çığır Açan Gelişme",
    content: "Bilim insanları, insan beyninin çalışma prensiplerini taklit eden yeni bir yapay zeka modeli geliştirdi...",
    imageUrl: "https://picsum.photos/800/400?random=1",
    category: "Teknoloji",
    viewCount: 1500,
    author: {
      fullName: "Ahmet Yılmaz"
    }
  },
  {
    id: 2,
    title: "İklim Değişikliği ile Mücadelede Yeni Adım",
    content: "Dünya liderleri, karbon emisyonlarını azaltmak için yeni bir anlaşmaya vardı...",
    imageUrl: "https://picsum.photos/800/400?random=2",
    category: "Çevre",
    viewCount: 1200,
    author: {
      fullName: "Ayşe Demir"
    }
  },
  {
    id: 3,
    title: "Uzay Turizmi Başlıyor",
    content: "SpaceX, ilk sivil uzay yolculuğu için hazırlıklarını tamamladı...",
    imageUrl: "https://picsum.photos/800/400?random=3",
    category: "Uzay",
    viewCount: 2000,
    author: {
      fullName: "Mehmet Kaya"
    }
  },
  {
    id: 4,
    title: "Yeni Nesil Elektrikli Araçlar Yolda",
    content: "Otomotiv devleri, yeni nesil elektrikli araç modellerini tanıttı...",
    imageUrl: "https://picsum.photos/800/400?random=4",
    category: "Otomotiv",
    viewCount: 800,
    author: {
      fullName: "Zeynep Şahin"
    }
  }
];

const Home = () => {
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [mostViewedNews, setMostViewedNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    // Use mock data instead of API calls
    setLatestNews(mockNews);
    setMostViewedNews([...mockNews].sort((a, b) => b.viewCount - a.viewCount));
    setFeaturedNews(mockNews.slice(0, 3));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) =>
        prev === featuredNews.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredNews.length]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Featured News Slider */}
        <Grid item xs={12} md={8}>
          {featuredNews[currentFeaturedIndex] && (
            <Paper
              component={RouterLink}
              to={`/news/${featuredNews[currentFeaturedIndex].id}`}
              sx={{
                position: 'relative',
                height: 400,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <CardMedia
                component="img"
                height="400"
                image={featuredNews[currentFeaturedIndex].imageUrl || 'https://via.placeholder.com/800x400'}
                alt={featuredNews[currentFeaturedIndex].title}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  p: 2,
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {featuredNews[currentFeaturedIndex].title}
                </Typography>
                <Typography variant="body2">
                  {featuredNews[currentFeaturedIndex].author.fullName}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Latest News */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Son Haberler
          </Typography>
          <List>
            {latestNews.slice(0, 5).map((news) => (
              <React.Fragment key={news.id}>
                <ListItem
                  component={RouterLink}
                  to={`/news/${news.id}`}
                >
                  <ListItemText
                    primary={news.title}
                    secondary={news.author.fullName}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Grid>

        {/* Most Viewed News */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            En Çok Okunanlar
          </Typography>
          <Grid container spacing={3}>
            {mostViewedNews.slice(0, 4).map((news) => (
              <Grid item xs={12} sm={6} md={3} key={news.id}>
                <Card
                  component={RouterLink}
                  to={`/news/${news.id}`}
                  sx={{ textDecoration: 'none', height: '100%' }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={news.imageUrl || 'https://via.placeholder.com/300x140'}
                    alt={news.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {news.author.fullName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 