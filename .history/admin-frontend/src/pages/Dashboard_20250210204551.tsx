import React from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Yönetim Paneli
            </Typography>
            <Typography variant="body1">
              Hoş geldiniz! Bu panelden haberleri, kullanıcıları ve rolleri yönetebilirsiniz.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 