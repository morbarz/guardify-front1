import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Select, MenuItem, Button, Snackbar, Alert,
  Box, TextField, InputAdornment, Chip
} from '@mui/material';
import { userService } from '../services/api';
import { User } from '../types';
import {
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

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ [mail: string]: string }>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

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

  const handleToastClose = () => {
    setToastOpen(false);
  };

  if (loading) return <Typography>Loading users...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      {/* Search Bar */}
      <Box my={2}>
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

      {/* Table of Users */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Current Role</strong></TableCell>
              <TableCell><strong>Change Role</strong></TableCell>
              <TableCell><strong>Update</strong></TableCell>
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
                    onClick={() => handleSubmit(user.mail)}
                    startIcon={<SaveIcon />}
                    size="small"
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar Notification */}
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
    </Box>
  );
};

export default UserRoleManager;
