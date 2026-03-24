import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteUser,
  getClient,
  getClients,
  saveClient as saveClientRequest,
} from '../../features/clients/services/client.service';

const getErrorMessage = (response, fallback) => {
  if (response?.message) {
    return response.message;
  }
  if (response?.code && typeof response.code === 'string') {
    return response.code;
  }
  return fallback;
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getClients();
      if (Array.isArray(response)) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to load clients.'));
    } catch {
      return rejectWithValue('Failed to load clients.');
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getClient(id);
      if (response?.client_id) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to load client.'));
    } catch {
      return rejectWithValue('Failed to load client.');
    }
  }
);

export const saveClient = createAsyncThunk(
  'clients/saveClient',
  async ({ form, id }, { rejectWithValue }) => {
    try {
      const response = await saveClientRequest(form, id);
      if (response?.client_id) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to save client.'));
    } catch {
      return rejectWithValue('Failed to save client.');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteUser(id);
      if (response?.message || response?.code) {
        return rejectWithValue(getErrorMessage(response, 'Failed to delete client.'));
      }
      return id;
    } catch {
      return rejectWithValue('Failed to delete client.');
    }
  }
);

const initialState = {
  items: [],
  currentClient: null,
  loading: false,
  currentClientLoading: false,
  saving: false,
  deleting: false,
  error: '',
  currentClientError: '',
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClientError: (state) => {
      state.error = '';
    },
    clearCurrentClient: (state) => {
      state.currentClient = null;
      state.currentClientError = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload || 'Failed to load clients.';
      })
      .addCase(fetchClientById.pending, (state) => {
        state.currentClientLoading = true;
        state.currentClientError = '';
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.currentClientLoading = false;
        state.currentClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.currentClientLoading = false;
        state.currentClient = null;
        state.currentClientError = action.payload || 'Failed to load client.';
      })
      .addCase(saveClient.pending, (state) => {
        state.saving = true;
        state.error = '';
        state.currentClientError = '';
      })
      .addCase(saveClient.fulfilled, (state, action) => {
        const savedClient = action.payload;
        const index = state.items.findIndex((client) => client.client_id === savedClient.client_id);

        state.saving = false;
        state.currentClient = savedClient;

        if (index >= 0) {
          state.items[index] = savedClient;
        } else {
          state.items.push(savedClient);
          state.items.sort((a, b) => a.client_id - b.client_id);
        }
      })
      .addCase(saveClient.rejected, (state, action) => {
        state.saving = false;
        state.currentClientError = action.payload || 'Failed to save client.';
      })
      .addCase(deleteClient.pending, (state) => {
        state.deleting = true;
        state.error = '';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((client) => client.client_id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete client.';
      });
  },
});

export const { clearClientError, clearCurrentClient } = clientsSlice.actions;
export default clientsSlice.reducer;
