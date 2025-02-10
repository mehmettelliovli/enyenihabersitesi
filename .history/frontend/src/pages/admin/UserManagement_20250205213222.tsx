import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
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
  TextField,
  Box,
  MenuItem,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Switch,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserRole {
  id: number;
  name: string;
}

interface TokenUser {
  id: number;
  email: string;
  fullName: string;
  roles: UserRole[];
}

interface User {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    isActive: true,
    roleIds: [] as number[],
  });
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const validateToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/auth/validate-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData: TokenUser = await response.json();
      // Check if user has required roles
      const hasRequiredRole = userData.roles.some((role: UserRole) => 
        ['SUPER_ADMIN', 'ADMIN'].includes(role.name)
      );

      if (!hasRequiredRole) {
        throw new Error('Insufficient permissions');
      }

      // Kullanıcının rollerini state'e kaydet
      setCurrentUserRoles(userData.roles.map((role: UserRole) => role.name));
    } catch (err: unknown) {
      console.error('Token validation error:', err);
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Önce rolleri çekelim
      const rolesResponse = await fetch('http://localhost:3000/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!rolesResponse.ok) {
        throw new Error('Roller yüklenirken hata oluştu');
      }

      const rolesData = await rolesResponse.json();
      setRoles(rolesData);

      // Sonra kullanıcıları çekelim
      const usersResponse = await fetch('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (usersResponse.status === 403) {
        throw new Error('Insufficient permissions');
      }

      if (!usersResponse.ok) {
        throw new Error('Kullanıcılar yüklenirken hata oluştu');
      }

      const usersData = await usersResponse.json();
      setUsers(usersData);

    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      if (err instanceof Error && err.message === 'Insufficient permissions') {
        setError('Bu sayfaya erişim yetkiniz bulunmamaktadır');
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        setError('Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Validate token on component mount
    validateToken();
    fetchData();
  }, [navigate, validateToken, fetchData]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        password: '',
        isActive: user.isActive,
        roleIds: user.roles.map(role => role.id),
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        isActive: true,
        roleIds: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      password: '',
      isActive: true,
      roleIds: [],
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedUser 
        ? `http://localhost:3000/users/${selectedUser.id}`
        : 'http://localhost:3000/users';
      
      const submitData = {
        ...formData,
        roleIds: formData.roleIds,
        ...(formData.password || !selectedUser ? { password: formData.password } : {})
      };

      const response = await fetch(url, {
        method: selectedUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İşlem başarısız');
      }

      handleCloseDialog();
      fetchData();
      setSnackbar({
        open: true,
        message: selectedUser ? 'Kullanıcı başarıyla güncellendi' : 'Kullanıcı başarıyla oluşturuldu',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err instanceof Error ? err.message : 'Kullanıcı kaydedilirken bir hata oluştu');
      setSnackbar({
        open: true,
        message: 'Kullanıcı kaydedilirken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      fetchData();
      setSnackbar({
        open: true,
        message: 'Kullanıcı başarıyla silindi',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Kullanıcı silinirken bir hata oluştu');
      setSnackbar({
        open: true,
        message: 'Kullanıcı silinirken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  // Kullanıcının rollerine göre seçilebilecek rolleri belirle
  const getAvailableRoles = useCallback(() => {
    // Eğer roller henüz yüklenmediyse boş array döndür
    if (!roles.length) {
      console.log('Roller henüz yüklenmedi');
      return [];
    }

    // Eğer kullanıcı rolleri henüz yüklenmediyse boş array döndür
    if (!currentUserRoles.length) {
      console.log('Kullanıcı rolleri henüz yüklenmedi');
      return [];
    }

    console.log('Mevcut roller:', roles);
    console.log('Kullanıcı rolleri:', currentUserRoles);

    if (currentUserRoles.includes('SUPER_ADMIN')) {
      return roles; // Tüm roller
    } else if (currentUserRoles.includes('ADMIN')) {
      return roles.filter(role => role.name === 'AUTHOR'); // Sadece AUTHOR rolü
    }
    return []; // Diğer kullanıcılar için boş array
  }, [roles, currentUserRoles]); // Bağımlılıkları ekledik

  // Kullanıcının SUPER_ADMIN olup olmadığını kontrol et
  const isSuperAdmin = currentUserRoles.includes('SUPER_ADMIN');

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

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kullanıcı Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Roller</TableCell>
              <TableCell>Durum</TableCell>
              {isSuperAdmin && <TableCell align="right">İşlemler</TableCell>}
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
                  <Switch
                    checked={user.isActive}
                    onChange={() => handleToggleActive(user)}
                    color="primary"
                  />
                </TableCell>
                {isSuperAdmin && (
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(user.id)} 
                      color="error"
                      disabled={user.roles.some(role => role.name === 'SUPER_ADMIN')}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              size="small"
              placeholder="Ad Soyad giriniz"
            />
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              size="small"
              placeholder="E-posta giriniz"
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser}
              size="small"
              placeholder="Şifre giriniz"
              helperText={selectedUser ? 'Şifreyi değiştirmek için doldurun' : ''}
            />
            <FormControl fullWidth required size="small" sx={{ minWidth: '100%' }}>
              <InputLabel id="role-select-label">Kullanıcı Rolleri</InputLabel>
              <Select
                labelId="role-select-label"
                value={formData.roleIds}
                label="Kullanıcı Rolleri"
                onChange={(e) => setFormData({
                  ...formData,
                  roleIds: e.target.value as number[],
                })}
                sx={{ width: '100%' }}
                multiple
              >
                {getAvailableRoles().map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name === 'SUPER_ADMIN' ? 'Süper Admin' :
                     role.name === 'ADMIN' ? 'Admin' :
                     role.name === 'AUTHOR' ? 'Yazar' : 'Kullanıcı'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="secondary">
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.fullName || !formData.email || (!selectedUser && !formData.password) || !formData.roleIds.length}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement; 