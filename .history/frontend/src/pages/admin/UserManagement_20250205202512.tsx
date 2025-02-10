import React, { useState, useEffect } from 'react';
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
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
    roleIds: [] as number[],
  });
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Token'dan kullanıcı rollerini çıkar
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserRoles(tokenData.roles || []);
    } catch (err) {
      console.error('Token parsing error:', err);
    }

    validateToken();
    fetchData();
  }, []);

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
      // Check if user has required roles
      const hasRequiredRole = userData.roles.some((role: { name: string }) => 
        ['SUPER_ADMIN', 'ADMIN'].includes(role.name)
      );

      if (!hasRequiredRole) {
        throw new Error('Insufficient permissions');
      }
    } catch (err: unknown) {
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

      if (usersResponse.status === 403 || rolesResponse.status === 403) {
        throw new Error('Insufficient permissions');
      }

      if (!usersResponse.ok || !rolesResponse.ok) {
        throw new Error('Veri çekme hatası');
      }

      const [usersData, rolesData] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json()
      ]);

      setUsers(usersData);
      setRoles(rolesData);
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
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        password: '',
        roleIds: user.roles.map(role => role.id),
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        fullName: '',
        password: '',
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
        // Rol ID'lerini sayısal diziye dönüştür
        roleIds: formData.roleIds.map(id => Number(id)),
        // Sadece yeni kullanıcı oluşturulurken veya şifre değiştirilirken şifreyi gönder
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
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err instanceof Error ? err.message : 'Kullanıcı kaydedilirken bir hata oluştu');
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
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Kullanıcı silinirken bir hata oluştu');
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
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
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
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!selectedUser}
              helperText={selectedUser ? 'Şifreyi değiştirmek için doldurun' : ''}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Roller</InputLabel>
              <Select
                multiple
                value={formData.roleIds}
                onChange={(e) => setFormData({
                  ...formData,
                  roleIds: e.target.value as number[],
                })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={roles.find(role => role.id === value)?.name}
                        size="small"
                      />
                    ))}
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

export default UserManagement; 