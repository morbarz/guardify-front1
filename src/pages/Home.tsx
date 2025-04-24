import React from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(to bottom right, #e3f2fd, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          p: 5,
          borderRadius: 5,
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <img
          src="/guardify-landing.jpg"
          alt="סמל משמר בתי המשפט"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'cover',
            marginBottom: 24,
            borderRadius: '50%',
            border: '2px solid #1976d2',
          }}
        />

        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Guardify
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          מערכת חכמה לניהול סידורי עבודה במשמר בתי המשפט
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ fontWeight: 'bold', py: 1.5, fontSize: '1rem' }}
          onClick={() => navigate('/login')}
        >
          התחברות
        </Button>
      </Paper>
    </Box>
  );
};

export default Home;