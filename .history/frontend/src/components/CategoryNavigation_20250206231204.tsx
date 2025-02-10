import { Box, Button, Typography } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isSelected = (id: number) => {
    const match = location.pathname.match(/\/category\/(\d+)/);
    if (!match) return false;
    return match[1] === id.toString();
  };

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
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{
          textDecoration: 'none',
          color: location.pathname === '/' ? 'primary.main' : 'text.primary',
          fontWeight: 'bold',
          marginRight: 4,
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        Tellioğlu
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            variant={isSelected(category.id) ? "contained" : "text"}
            sx={{
              minWidth: '100px',
              textTransform: 'none',
              fontWeight: isSelected(category.id) ? 'bold' : 'normal',
              ...(isSelected(category.id) ? {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              } : {
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }),
            }}
          >
            {category.name}
          </Button>
        ))}
      </Box>
    </Box>
  );
} 