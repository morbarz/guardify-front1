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
  AlertTitle,
  ThemeProvider,
  createTheme
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
  },
});

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
    console.log('ניסיון התחברות עבור כתובת דוא"ל:', mail);
    
    try {
      const credentials: LoginCredentials = { mail, password };
      console.log('שולח בקשת התחברות לשרת...');
      await login(credentials);
      console.log('התחברות הצליחה, מעביר ללוח הבקרה...');
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
      
      console.error('התחברות נכשלה:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let details = '';
      if (error.response?.status) {
        details += `סטטוס: ${error.response.status}\n`;
      }
      if (error.response?.data?.message) {
        details += `הודעה: ${error.response.data.message}\n`;
      } else if (error.message) {
        details += `שגיאה: ${error.message}\n`;
      }
      if (error.response?.data?.error) {
        details += `שגיאת שרת: ${error.response.data.error}\n`;
      }
      
      setErrorDetails(details || 'אירעה שגיאה לא ידועה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: '12px' }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
              Guardify
            </Typography>
            <Typography variant="subtitle1" align="center" gutterBottom color="text.secondary">
              התחברות למערכת
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                <AlertTitle>התחברות נכשלה</AlertTitle>
                {error}
              </Alert>
            )}
            
            {errorDetails && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                <AlertTitle>פרטי השגיאה</AlertTitle>
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
                label="כתובת דוא״ל"
                name="mail"
                autoComplete="email"
                autoFocus
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="סיסמה"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: '8px' }}
                disabled={isLoading}
              >
                {isLoading ? 'מתחבר...' : 'התחברות'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;