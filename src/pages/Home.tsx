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
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          p: 4,
          borderRadius: 4,
          backgroundColor: '#ffffff',
        }}
      >
        <img
          src="/guardify-landing.jpg"
          alt="סמל משמר בתי המשפט"
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain',
            marginBottom: 20,
            borderRadius: '12px',
          }}
        />

        <Typography variant="h5" gutterBottom fontWeight="bold">
          ברוך הבא ל־Guardify
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          מערכת לניהול סידור עבודה של משמר בתי המשפט
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ fontWeight: 'bold' }}
          onClick={() => navigate('/login')}
        >
          התחברות
        </Button>
      </Paper>
    </Box>
  );
};

export default Home;