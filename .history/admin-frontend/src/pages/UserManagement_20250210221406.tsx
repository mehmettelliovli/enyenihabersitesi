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
  Chip,
  Box,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
}

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Sadece SUPER_ADMIN rolüne sahip kullanıcılar bu sayfaya erişebilir
  const isSuperAdmin = currentUser?.roles.some(role => role.name === 'SUPER_ADMIN');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Kullanıcılar yüklenirken hata oluştu');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Kullanıcılar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Roller yüklenirken hata oluştu');
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError('Roller yüklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setSelectedRoles(user.roles.map(role => role.id));
      setFormData({
        email: user.email,
        password: '',
        fullName: user.fullName,
      });
    } else {
      setSelectedUser(null);
      setSelectedRoles([]);
      setFormData({
        email: '',
        password: '',
        fullName: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedRoles([]);
    setFormData({
      email: '',
      password: '',
      fullName: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const url = selectedUser
        ? `http://localhost:3000/users/${selectedUser.id}`
        : 'http://localhost:3000/users';

      const method = selectedUser ? 'PATCH' : 'POST';

      const data = {
        ...formData,
        roleIds: selectedRoles,
      };

      // Eğer düzenleme modundaysa ve şifre boşsa, şifreyi gönderme
      if (selectedUser && !formData.password) {
        delete data.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Kullanıcı kaydedilirken hata oluştu');

      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError('Kullanıcı kaydedilirken bir hata oluştu');
      console.error(err);
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

      await fetchUsers();
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
              <TableCell>Roller</TableCell>
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
                  {user.roles.map((role) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      sx={{ mr: 0.5, mb: 0.5 }}
                      size="small"
                    />
                  ))}
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
          {selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
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
            helperText={selectedUser ? 'Şifreyi değiştirmek istemiyorsanız boş bırakın' : ''}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Roller</InputLabel>
            <Select
              multiple
              value={selectedRoles}
              onChange={(e) => setSelectedRoles(e.target.value as number[])}
              label="Roller"
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