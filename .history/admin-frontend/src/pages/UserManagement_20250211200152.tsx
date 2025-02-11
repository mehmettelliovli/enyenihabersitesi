import { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  roles: Role[];
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roleId: '',
  });
  const navigate = useNavigate();

  // Sadece SUPER_ADMIN rolüne sahip kullanıcılar bu sayfaya erişebilir
  const isSuperAdmin = currentUser?.roles.some(role => role.name === 'SUPER_ADMIN');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usersResponse, rolesResponse] = await Promise.all([
        axios.get('http://localhost:3000/users', { headers }),
        axios.get('http://localhost:3000/roles', { headers }),
      ]);

      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
    } catch (err) {
      console.error('Veri çekme hatası:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        password: '',
        roleId: user.roles[0]?.id.toString() || '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        roleId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      roleId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        roleIds: formData.roleId ? [parseInt(formData.roleId)] : [],
      };

      if (formData.password) {
        submitData['password'] = formData.password;
      }

      if (selectedUser) {
        await axios.patch(
          `http://localhost:3000/users/${selectedUser.id}`,
          submitData,
          { headers }
        );
      } else {
        await axios.post('http://localhost:3000/users', submitData, { headers });
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error('Kullanıcı kaydetme hatası:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Bu işlem için yetkiniz bulunmamaktadır.');
        } else {
          setError(err.response?.data?.message || 'Kullanıcı kaydedilirken bir hata oluştu');
        }
      } else {
        setError('Kullanıcı kaydedilirken bir hata oluştu');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Kullanıcı silinirken hata oluştu');

      await fetchData();
    } catch (err) {
      setError('Kullanıcı silinirken bir hata oluştu');
      console.error(err);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Kullanıcı Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles[0]?.name || 'Rol Yok'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenDialog(user)}
                    sx={{ mr: 1 }}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(user.id)}
                  >
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Ad Soyad"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="normal"
            required={!selectedUser}
            fullWidth
            label="Şifre"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText={selectedUser ? "Şifreyi değiştirmek istemiyorsanız boş bırakın" : ""}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.roleId}
              label="Rol"
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 