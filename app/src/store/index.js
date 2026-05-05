import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientsReducer from './slices/clientsSlice';
import departmentsReducer from './slices/departementSlice';
import feedbackReducer from './slices/feedbackSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    departments: departmentsReducer,
    feedback: feedbackReducer,
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
