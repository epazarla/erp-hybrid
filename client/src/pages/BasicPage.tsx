import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function BasicPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Temel Sayfa</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bu çok basit bir sayfa. Beyaz ekran sorununu teşhis etmek için kullanılıyor.
        </Typography>
      </Paper>
    </Box>
  );
}
