import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Select, MenuItem, Button
} from '@mui/material';
import { userService } from '../services/api';
import { User } from '../types';

const allowedRoles = ['guard', 'bakar', 'shift_manager', 'manager', 'admin'];

const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ [mail: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        setUsers(response);
        // initialize selectedRoles with current user roles
        const initialRoles: { [mail: string]: string } = {};
        response.forEach((user) => {
          initialRoles[user.mail] = user.role;
        });
        setSelectedRoles(initialRoles);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
      alert(`Role updated to ${newRole}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  if (loading) return <Typography>Loading users...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Current Role</strong></TableCell>
            <TableCell><strong>Change Role</strong></TableCell>
            <TableCell><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.mail}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.mail}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  value={selectedRoles[user.mail]}
                  onChange={(e) => handleChange(user.mail, e.target.value)}
                  size="small"
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
  );
};

export default UserRoleManager;
