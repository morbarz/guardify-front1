import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent, CardActions, Divider } from '@mui/material';

export const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Card Skeleton */}
      <Card elevation={3} sx={{ mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton 
              variant="circular"
              width={56}
              height={56}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton 
                variant="text"
                width="60%"
                height={40}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              />
              <Skeleton 
                variant="text"
                width="40%"
                height={24}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Shift Submissions Card Skeleton */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={28} height={28} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="40%" height={32} />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={12} height={12} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="rectangular" height={36} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </CardActions>
          </Card>
        </Grid>

        {/* Quick Actions Card Skeleton */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" height={36} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={36} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 