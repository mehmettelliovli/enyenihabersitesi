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
} from '@mui/material';
import axios from 'axios';

interface Author {
  id: number;
  fullName: string;
  profileImage: string;
  bio: string;
}

const Authors = () => {
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users');
        setAuthors(response.data);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Yazarlarımız
      </Typography>
      <Grid container spacing={4}>
        {authors.map((author) => (
          <Grid item xs={12} sm={6} md={4} key={author.id}>
            <Card
              component={RouterLink}
              to={`/author/${author.id}`}
              sx={{ textDecoration: 'none', height: '100%' }}
            >
              <CardMedia
                component="img"
                height="240"
                image={author.profileImage || 'https://via.placeholder.com/300x240'}
                alt={author.fullName}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {author.fullName}
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
                  {author.bio}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Authors; 