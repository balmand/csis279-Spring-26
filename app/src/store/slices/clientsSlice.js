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

const isBrowserOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;
const OFFLINE_SAVE_MESSAGE = 'Saved offline. This change will sync automatically when you reconnect.';

const createOptimisticClient = (form, id, tempClientId) => ({
  client_id: id ? Number(id) : tempClientId,
  client_name: form.name,
  client_email: form.email,
});

const getPendingChangeKey = (change) => change.id ?? change.tempClientId;

const buildPendingChange = (form, id, existingPendingChange) => {
  const numericId = id ? Number(id) : null;
  const isTempClient = numericId !== null && numericId < 0;
  const persistedId = isTempClient ? null : numericId;
  const tempClientId = isTempClient
    ? numericId
    : existingPendingChange?.tempClientId ?? (persistedId ? null : -Date.now());

  return {
    requestId: existingPendingChange?.requestId ?? `${persistedId || 'new'}-${Date.now()}`,
    id: persistedId,
    form,
    tempClientId,
    optimisticClient: createOptimisticClient(form, persistedId, tempClientId),
  };
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    if (isBrowserOffline()) {
      return rejectWithValue('You are offline. Reconnect to refresh clients from the server.');
    }

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
  async (id, { getState, rejectWithValue }) => {
    const numericId = Number(id);

    if (numericId < 0) {
      const localClient = getState().clients.items.find((item) => item.client_id === numericId);

      if (localClient) {
        return localClient;
      }
    }

    if (isBrowserOffline()) {
      return rejectWithValue('You are offline. Reconnect to load this client from the server.');
    }

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
  async ({ form, id }, { getState, rejectWithValue }) => {
    const numericId = id ? Number(id) : null;
    const existingPendingChange = getState().clients.pendingChanges.find(
      (change) => getPendingChangeKey(change) === (numericId ?? null)
    );
    const shouldQueueLocally = isBrowserOffline() || numericId < 0;

    if (shouldQueueLocally) {
      return {
        queued: true,
        pendingChange: buildPendingChange(form, numericId, existingPendingChange),
      };
    }

    try {
      const response = await saveClientRequest(form, numericId);
      if (response?.client_id) {
        return {
          queued: false,
          client: response,
        };
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to save client.'));
    } catch {
      return {
        queued: true,
        pendingChange: buildPendingChange(form, numericId, existingPendingChange),
      };
    }
  }
);

export const syncPendingChanges = createAsyncThunk(
  'clients/syncPendingChanges',
  async (_, { getState, rejectWithValue }) => {
    if (isBrowserOffline()) {
      return rejectWithValue('Still offline. Pending changes will sync when the connection returns.');
    }

    const { pendingChanges } = getState().clients;

    if (!pendingChanges.length) {
      return [];
    }

    const results = [];

    for (const change of pendingChanges) {
      try {
        const response = await saveClientRequest(change.form, change.id);

        if (!response?.client_id) {
          return rejectWithValue(getErrorMessage(response, 'Failed to sync pending client changes.'));
        }

        results.push({
          requestId: change.requestId,
          client: response,
          tempClientId: change.tempClientId,
        });
      } catch {
        return rejectWithValue('Failed to sync pending client changes.');
      }
    }

    return results;
  },
  {
    condition: (_, { getState }) => {
      const { syncingPending, pendingChanges } = getState().clients;
      return !syncingPending && pendingChanges.length > 0;
    },
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    if (isBrowserOffline()) {
      return rejectWithValue('You are offline. Reconnect before deleting a client.');
    }

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
  syncingPending: false,
  socketConnected: false,
  isOffline: typeof navigator !== 'undefined' ? navigator.onLine === false : false,
  pendingChanges: [],
  error: '',
  currentClientError: '',
};

const upsertClient = (state, client) => {
  const index = state.items.findIndex((item) => item.client_id === client.client_id);

  if (index >= 0) {
    state.items[index] = client;
  } else {
    state.items.push(client);
  }

  state.items.sort((a, b) => a.client_id - b.client_id);
};

const removeClientById = (state, clientId) => {
  state.items = state.items.filter((item) => item.client_id !== clientId);
};

const mergePendingClients = (clients, pendingChanges) => {
  const mergedClients = [...clients];

  pendingChanges.forEach((change) => {
    const index = mergedClients.findIndex((item) => item.client_id === change.optimisticClient.client_id);

    if (index >= 0) {
      mergedClients[index] = change.optimisticClient;
    } else {
      mergedClients.push(change.optimisticClient);
    }
  });

  return mergedClients.sort((a, b) => a.client_id - b.client_id);
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
    socketConnected: (state) => {
      state.socketConnected = true;
    },
    socketDisconnected: (state) => {
      state.socketConnected = false;
    },
    browserOnline: (state) => {
      state.isOffline = false;
    },
    browserOffline: (state) => {
      state.isOffline = true;
      state.socketConnected = false;
    },
    clientSynced: (state, action) => {
      const client = action.payload;

      if (!client?.client_id) {
        return;
      }

      upsertClient(state, client);

      if (state.currentClient?.client_id === client.client_id) {
        state.currentClient = client;
      }
    },
    clearPendingSyncError: (state) => {
      state.error = '';
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
        state.items = mergePendingClients(action.payload, state.pendingChanges);
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        if (!state.isOffline) {
          state.items = [];
        }
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
        state.saving = false;

        if (action.payload.queued) {
          const pendingChange = action.payload.pendingChange;
          const { optimisticClient } = pendingChange;
          state.currentClient = optimisticClient;
          upsertClient(state, optimisticClient);

          state.pendingChanges = state.pendingChanges.filter(
            (change) => getPendingChangeKey(change) !== getPendingChangeKey(pendingChange)
          );
          state.pendingChanges.push(pendingChange);

          state.currentClientError = OFFLINE_SAVE_MESSAGE;
          return;
        }

        const savedClient = action.payload.client;
        state.currentClient = savedClient;
        upsertClient(state, savedClient);
        state.pendingChanges = state.pendingChanges.filter(
          (change) => getPendingChangeKey(change) !== savedClient.client_id
        );

        if (state.currentClientError === OFFLINE_SAVE_MESSAGE) {
          state.currentClientError = '';
        }
      })
      .addCase(saveClient.rejected, (state, action) => {
        state.saving = false;
        state.currentClientError = action.payload || 'Failed to save client.';
      })
      .addCase(syncPendingChanges.pending, (state) => {
        state.syncingPending = true;
        state.error = '';
      })
      .addCase(syncPendingChanges.fulfilled, (state, action) => {
        state.syncingPending = false;

        action.payload.forEach(({ requestId, client, tempClientId }) => {
          if (tempClientId) {
            removeClientById(state, tempClientId);
          }

          upsertClient(state, client);
          state.pendingChanges = state.pendingChanges.filter((change) => change.requestId !== requestId);

          if (
            state.currentClient?.client_id === tempClientId ||
            state.currentClient?.client_id === client.client_id
          ) {
            state.currentClient = client;
          }
        });

        if (!state.pendingChanges.length && state.currentClientError === OFFLINE_SAVE_MESSAGE) {
          state.currentClientError = '';
        }
      })
      .addCase(syncPendingChanges.rejected, (state, action) => {
        state.syncingPending = false;
        state.error = action.payload || 'Failed to sync pending client changes.';
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

export const {
  browserOffline,
  browserOnline,
  clearClientError,
  clearPendingSyncError,
  clearCurrentClient,
  clientSynced,
  socketConnected,
  socketDisconnected,
} = clientsSlice.actions;
export default clientsSlice.reducer;
