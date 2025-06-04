import { createTheme } from '@mui/material/styles';
import { blue, pink, grey } from '@mui/material/colors';

// Performans için optimize edilmiş tema
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: pink[500],
      light: pink[300],
      dark: pink[700],
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  // Basitleştirilmiş tipografi - daha az stil hesaplaması
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  // Minimum bileşen override'ları - daha iyi performans için
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Basitleştirilmiş koyu tema
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: pink[300],
      light: pink[200],
      dark: pink[400],
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  // Tipografi ve bileşenleri açık temadan miras al
  typography: lightTheme.typography,
  components: lightTheme.components,
});

export { lightTheme, darkTheme };
