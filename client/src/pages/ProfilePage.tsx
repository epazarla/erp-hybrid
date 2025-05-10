import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import ProfileSettings from '../components/profile/ProfileSettings';

import { User } from '../services/DirectStorageService';

interface ProfilePageProps {
  user: {
    id?: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  onUpdateProfile: (userData: Partial<User>) => void;
}

export default function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  return (
    <Box sx={{ 
      width: '100%',
      minWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px' }
    }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="medium">
          Profil
        </Typography>
        
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="#"
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Ana Sayfa
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Profil
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ProfileSettings user={user} onUpdateProfile={onUpdateProfile} />
      </Paper>
    </Box>
  );
}
