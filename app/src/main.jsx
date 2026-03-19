import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './app/App';
import { store } from './store';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e5aa8',
    },
    secondary: {
      main: '#0f766e',
    },
  },
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
