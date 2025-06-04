import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Slider,
  Button,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Task as TaskIcon,
  Message as MessageIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import notificationService, { NotificationType, NotificationSettings, NotificationSoundType } from '../../services/NotificationService';

interface NotificationSettingsProps {
  onSettingsChange?: (settings: NotificationSettings) => void;
}

export default function NotificationSettingsComponent({ onSettingsChange }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Bildirim izinlerini kontrol et
    if (settings.desktop && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        notificationService.requestPermission();
      }
    }
  }, [settings.desktop]);

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    handleSettingChange('soundVolume', newValue as number);
  };

  const handleSoundTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    handleSettingChange('soundType', event.target.value as NotificationSoundType);
  };

  const handleTestSound = (type: NotificationSoundType = settings.soundType) => {
    notificationService.testSound(type);
    setSnackbarMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} bildirim sesi test edildi`);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getSoundTypeIcon = (type: NotificationSoundType) => {
    switch (type) {
      case NotificationSoundType.BELL:
        return <NotificationsIcon />;
      case NotificationSoundType.CHIME:
        return <VolumeUpIcon />;
      case NotificationSoundType.ALERT:
        return <WarningIcon />;
      case NotificationSoundType.NOTIFICATION:
        return <InfoIcon />;
      case NotificationSoundType.PING:
        return <CheckIcon />;
      case NotificationSoundType.NONE:
        return <VolumeUpIcon sx={{ opacity: 0.5 }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <NotificationsIcon sx={{ mr: 1 }} />
        Bildirim Ayarları
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Bildirimleri Etkinleştir"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                  color="primary"
                  disabled={!settings.enabled}
                />
              }
              label="Bildirim Seslerini Etkinleştir"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.desktop}
                  onChange={(e) => handleSettingChange('desktop', e.target.checked)}
                  color="primary"
                  disabled={!settings.enabled}
                />
              }
              label="Masaüstü Bildirimlerini Etkinleştir"
            />
          </FormGroup>
        </Grid>
        
        {settings.enabled && settings.sound && (
          <>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VolumeUpIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Ses Seviyesi</Typography>
              </Box>
              <Slider
                value={settings.soundVolume}
                onChange={handleVolumeChange}
                aria-labelledby="sound-volume-slider"
                step={0.1}
                marks
                min={0}
                max={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ ml: 1, width: 'calc(100% - 16px)' }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="sound-type-label">Varsayılan Bildirim Sesi</InputLabel>
                <Select
                  labelId="sound-type-label"
                  id="sound-type-select"
                  value={settings.soundType}
                  label="Varsayılan Bildirim Sesi"
                  onChange={handleSoundTypeChange as any}
                  disabled={!settings.sound}
                >
                  {Object.values(NotificationSoundType).map((type) => (
                    <MenuItem key={type} value={type} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getSoundTypeIcon(type as NotificationSoundType)}
                        <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {type === NotificationSoundType.BELL ? 'Zil' : 
                           type === NotificationSoundType.CHIME ? 'Çan' : 
                           type === NotificationSoundType.ALERT ? 'Uyarı' : 
                           type === NotificationSoundType.NOTIFICATION ? 'Bildirim' : 
                           type === NotificationSoundType.PING ? 'Ping' : 
                           type === NotificationSoundType.NONE ? 'Ses Yok' : type}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleTestSound()}
                  disabled={!settings.sound}
                >
                  Sesi Test Et
                </Button>
              </Box>
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Bildirim Sesleri Testi
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.values(NotificationSoundType).filter(type => type !== NotificationSoundType.NONE).map((type) => (
              <Tooltip key={type} title={`${type === NotificationSoundType.BELL ? 'Zil' : 
                                           type === NotificationSoundType.CHIME ? 'Çan' : 
                                           type === NotificationSoundType.ALERT ? 'Uyarı' : 
                                           type === NotificationSoundType.NOTIFICATION ? 'Bildirim' : 
                                           type === NotificationSoundType.PING ? 'Ping' : type} sesini test et`}>
                <span>
                  <IconButton
                    onClick={() => handleTestSound(type as NotificationSoundType)}
                    disabled={!settings.enabled || !settings.sound}
                    color="primary"
                    size="small"
                  >
                    {getSoundTypeIcon(type as NotificationSoundType)}
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Box>
        </Grid>
        
        {settings.desktop && 'Notification' in window && Notification.permission === 'denied' && (
          <Grid item xs={12}>
            <Alert severity="warning">
              Tarayıcı bildirim izinleri reddedilmiş. Masaüstü bildirimleri almak için tarayıcı ayarlarından izin vermeniz gerekiyor.
            </Alert>
          </Grid>
        )}
      </Grid>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Paper>
  );
}
