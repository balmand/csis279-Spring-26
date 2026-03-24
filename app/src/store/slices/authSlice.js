import { createSlice } from '@reduxjs/toolkit';

const loadClientFromStorage = () => {
  try {
    const stored = localStorage.getItem('client');
    console.log(localStorage.getItem('client'));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState = {
  client: loadClientFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action) => {
      state.client = action.payload;
    },
    signOut: (state) => {
      state.client = null;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
