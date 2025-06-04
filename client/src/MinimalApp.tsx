import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Paper } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lightTheme } from './theme';

function MinimalPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Minimal ERP</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bu minimal bir sayfa. Beyaz ekran sorununu çözmek için oluşturulmuştur.
        </Typography>
      </Paper>
    </Box>
  );
}

function MinimalApp() {
  console.log('MinimalApp rendering');
  
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="*" element={<MinimalPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default MinimalApp;
