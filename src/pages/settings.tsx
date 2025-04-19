import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Settings: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleChangePassword = async () => {
    console.log('🔁 נשלחת בקשה לשינוי סיסמה');
  
    try {
      await axios.patch(
        '/users/change-password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessage('הסיסמה שונתה בהצלחה');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'שגיאה בעת שינוי הסיסמה');
      setMessage('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        הגדרות
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">פרטי משתמש</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography>
          <strong>שם:</strong> {user.name}
        </Typography>
        <Typography>
          <strong>מייל:</strong> {user.mail}
        </Typography>
        <Typography>
          <strong>תפקיד:</strong> {user.role}
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6">שינוי סיסמה</Typography>
        <Divider sx={{ my: 2 }} />

        <TextField
          label="סיסמה נוכחית"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <TextField
          label="סיסמה חדשה"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button variant="contained" onClick={handleChangePassword}>
          עדכן סיסמה
        </Button>

        {message && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;