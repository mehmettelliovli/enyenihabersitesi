import { Box, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{
          textDecoration: 'none',
          color: 'primary.main',
          fontWeight: 'bold',
          marginRight: 4,
        }}
      >
        Tellioğlu
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            {category.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
} 