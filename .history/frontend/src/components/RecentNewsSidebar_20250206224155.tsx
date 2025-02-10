import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface News {
  id: number;
  title: string;
  createdAt: string;
  imageUrl: string;
  category: {
    name: string;
  };
}

export default function RecentNewsSidebar() {
  const [recentNews, setRecentNews] = useState<News[]>([]);

  useEffect(() => {
    const fetchRecentNews = async () => {
      try {
        const response = await axios.get('http://localhost:3000/news/latest?limit=10');
        setRecentNews(response.data);
      } catch (error) {
        console.error('Son haberler yüklenirken hata:', error);
      }
    };

    fetchRecentNews();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Son Eklenen Haberler
      </Typography>
      <List>
        {recentNews.map((news, index) => (
          <div key={news.id}>
            <ListItem
              component={Link}
              to={`/news/${news.id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                py: 2,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Box
                    component="img"
                    src={news.imageUrl}
                    alt={news.title}
                    sx={{
                      width: '100%',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.2em',
                          maxHeight: '2.4em',
                        }}
                      >
                        {news.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {news.category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </ListItem>
            {index < recentNews.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Paper>
  );
} 