import React from 'react';
import { Skeleton, Box } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
  spacing?: number;
  animation?: 'pulse' | 'wave' | false;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 40,
  count = 1,
  spacing = 1,
  animation = 'wave',
}) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} mb={index < count - 1 ? spacing : 0}>
          <Skeleton
            variant={variant}
            width={width}
            height={height}
            animation={animation}
          />
        </Box>
      ))}
    </Box>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" gap={2} mb={1}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rectangular"
              width="100%"
              height={40}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <Box p={2}>
      <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
      <Box mt={2}>
        <Skeleton variant="text" width="60%" height={30} animation="wave" />
        <Skeleton variant="text" width="80%" height={20} animation="wave" />
        <Skeleton variant="text" width="40%" height={20} animation="wave" />
      </Box>
    </Box>
  );
}; 