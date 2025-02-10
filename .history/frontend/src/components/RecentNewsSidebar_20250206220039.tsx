import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface News {
  id: number;
  title: string;
  createdAt: string;
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
              }}
            >
              <ListItemText
                primary={news.title}
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
            </ListItem>
            {index < recentNews.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Paper>
  );
} 