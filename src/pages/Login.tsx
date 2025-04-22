import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  AlertTitle
} from '@mui/material';

const Login: React.FC = () => {
  const [mail, setMail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorDetails(null);
    console.log('Login attempt initiated for email:', mail);
    
    try {
      const credentials: LoginCredentials = { mail, password };
      console.log('Sending login request to server...');
      await login(credentials);
      console.log('Login successful, redirecting to dashboard...');
      navigate('/redirect');
    } catch (err: unknown) {
      const error = err as { 
        message?: string; 
        response?: { 
          status?: number; 
          data?: { 
            message?: string; 
            error?: string 
          } 
        } 
      };
      
      console.error('Login failed:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Create a detailed error message
      let details = '';
      if (error.response?.status) {
        details += `Status: ${error.response.status}\n`;
      }
      if (error.response?.data?.message) {
        details += `Message: ${error.response.data.message}\n`;
      } else if (error.message) {
        details += `Error: ${error.message}\n`;
      }
      if (error.response?.data?.error) {
        details += `Server Error: ${error.response.data.error}\n`;
      }
      
      setErrorDetails(details || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Login to Guardify
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Login Failed</AlertTitle>
              {error}
            </Alert>
          )}
          
          {errorDetails && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error Details</AlertTitle>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {errorDetails}
              </pre>
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="mail"
              label="Email Address"
              name="mail"
              autoComplete="email"
              autoFocus
              value={mail}
              onChange={(e) => setMail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;