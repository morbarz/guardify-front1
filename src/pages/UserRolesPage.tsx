import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, InputAdornment, Chip
} from '@mui/material';
import { adminService, userService } from '../services/api';
import { User } from '../types';
import {
  LockReset as LockResetIcon,
  Save as SaveIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const allowedRoles = ['guard', 'bakar', 'shift_manager', 'manager', 'admin'];

const roleColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  guard: 'default',
  bakar: 'info',
  shift_manager: 'success',
  manager: 'warning',
  admin: 'error'
};

const UserRolesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ [mail: string]: string }>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUserMail, setSelectedUserMail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        if (response.success && Array.isArray(response.data)) {
          const typedUsers = response.data.map(user => ({
            ...user,
            role: user.role as "guard" | "bakar" | "shift_manager" | "admin"
          }));
          setUsers(typedUsers);
          setFilteredUsers(typedUsers);
          const roles: { [mail: string]: string } = {};
          typedUsers.forEach((user) => {
            roles[user.mail] = user.role;
          });
          setSelectedRoles(roles);
        } else {
          setError(response.message || 'Failed to fetch users');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    const lower = value.toLowerCase();
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(lower) || u.mail.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  };

  const handleChange = (mail: string, newRole: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [mail]: newRole,
    }));
  };

  const handleSubmit = async (mail: string) => {
    const newRole = selectedRoles[mail];
    try {
      await userService.givePermission(mail, newRole);
      setToastMessage(`Role updated to "${newRole}" for ${mail}`);
      setToastSeverity('success');
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update role');
      setToastSeverity('error');
    } finally {
      setToastOpen(true);
    }
  };

  const openPasswordDialog = (mail: string) => {
    setSelectedUserMail(mail);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordError(null);
  };

  const handlePasswordChangeSubmit = async () => {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      await adminService.adminChangePassword(selectedUserMail, newPassword);
      setToastMessage(`Password changed for ${selectedUserMail}`);
      setToastSeverity('success');
      closePasswordDialog();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to change password');
      setToastSeverity('error');
    } finally {
      setToastOpen(true);
    }
  };

  const handleToastClose = () => {
    setToastOpen(false);
  };

  if (loading) return <Typography>Loading users...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage User Roles
      </Typography>

      {/* Search Bar */}
      <Box my={3}>
        <TextField
          placeholder="Search by name or email"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Current Role</strong></TableCell>
              <TableCell><strong>Change Role</strong></TableCell>
              <TableCell><strong>Update</strong></TableCell>
              <TableCell><strong>Password</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.mail}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.mail}</TableCell>
                <TableCell>
                  <Chip label={user.role} color={roleColors[user.role] || 'default'} />
                </TableCell>
                <TableCell>
                  <Select
                    value={selectedRoles[user.mail]}
                    onChange={(e) => handleChange(user.mail, e.target.value)}
                    size="small"
                    fullWidth
                  >
                    {allowedRoles.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSubmit(user.mail)}
                  >
                    Update
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<LockResetIcon />}
                    onClick={() => openPasswordDialog(user.mail)}
                  >
                    Reset
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={closePasswordDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!passwordError}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog}>Cancel</Button>
          <Button onClick={handlePasswordChangeSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserRolesPage;
