import React, { ReactNode, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (path?: string) => {
    setAnchorEl(null);
    if (path) navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={4}>       
         <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/redirect')}
          >
            Guardify
          </Typography>

          {user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                
              </Typography>

              <IconButton color="inherit" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>

              <Menu anchorEl={anchorEl} open={open} onClose={() => handleMenuClose()}>
                {/* תפריט מותאם לפי תפקיד */}
                {user.role === 'admin' ? (
                  <>
                    <MenuItem onClick={() => handleMenuClose('/admin/change-roles')}>ניהול המשתמשים</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/admin/schedule-editor')}>עריכת הסידור</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/admin/submission-status')}>סטטוס הגשות</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/register')}>רישום משתמש חדש</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/settings')}>הגדרות</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/admin/schedules')}>כל הסידורים</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => handleMenuClose('/my-shifts')}>המשמרות שלי</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/submit/current')}>הגשת משמרות</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/submit/history')}>היסטוריית הגשות</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/settings')}>הגדרות</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/my-schedule')}>סידור העבודה שלי</MenuItem>
                    <MenuItem onClick={() => handleMenuClose('/past-schedules')}>סידורים קודמים</MenuItem>
                  </>
                )}
              </Menu>

              <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
                התנתקות
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              התחברות
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} גארדיפיי. כל הזכויות שמורות.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
