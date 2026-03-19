import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Persist auth client to localStorage whenever it changes
store.subscribe(() => {
  const client = store.getState().auth.client;
  try {
    if (client) {
      localStorage.setItem('client', JSON.stringify(client));
    } else {
      localStorage.removeItem('client');
    }
  } catch {
    // ignore storage errors
  }
});
