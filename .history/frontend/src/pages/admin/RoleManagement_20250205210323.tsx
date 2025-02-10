import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

const RoleManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/auth/validate-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      const hasRequiredRole = userData.roles.some((role: { name: string }) => 
        role.name === 'SUPER_ADMIN'
      );

      if (!hasRequiredRole) {
        throw new Error('Insufficient permissions');
      }

      setCurrentUserRoles(userData.roles.map(role => role.name));
    } catch (err) {
      console.error('Token validation error:', err);
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('http://localhost:3000/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/roles', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!usersResponse.ok || !rolesResponse.ok) {
        throw new Error('Veri çekme hatası');
      }

      const [usersData, rolesData] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json()
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    validateToken();
    fetchData();
  }, [navigate]);

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(role => role.id));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedUser) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleIds: selectedRoles
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Güncelleme başarısız');
      }

      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Error updating roles:', err);
      setError(err instanceof Error ? err.message : 'Roller güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Rol Yönetimi
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Mevcut Roller</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5,
                        bgcolor: role.name === 'SUPER_ADMIN' ? '#f44336' :
                                role.name === 'ADMIN' ? '#2196f3' :
                                role.name === 'AUTHOR' ? '#4caf50' : '#757575',
                        color: 'white'
                      }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenDialog(user)}
                    disabled={user.email === 'mehmet_developer@hotmail.com'}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Kullanıcı Rollerini Düzenle: {selectedUser?.fullName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Roller</InputLabel>
              <Select
                multiple
                value={selectedRoles}
                onChange={(e) => setSelectedRoles(e.target.value as number[])}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const role = roles.find(r => r.id === value);
                      return (
                        <Chip
                          key={value}
                          label={role?.name}
                          sx={{
                            bgcolor: role?.name === 'SUPER_ADMIN' ? '#f44336' :
                                    role?.name === 'ADMIN' ? '#2196f3' :
                                    role?.name === 'AUTHOR' ? '#4caf50' : '#757575',
                            color: 'white'
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleManagement; 