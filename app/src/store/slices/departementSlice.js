import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getDepartments,
  getDepartment,
  saveDepartment as saveDepartmentRequest,
  deleteDepartment as deleteDepartmentRequest,
} from '../../features/departments/services/departments.service';

const getErrorMessage = (response, fallback) => {
  if (response?.message) {
    return response.message;
  }
  if (response?.code && typeof response.code === 'string') {
    return response.code;
  }
  return fallback;
};

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDepartments();
      if (Array.isArray(response)) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to load departments.'));
    } catch {
      return rejectWithValue('Failed to load departments.');
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchDepartmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getDepartment(id);
      if (response?.dep_id) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to load department.'));
    } catch {
      return rejectWithValue('Failed to load department.');
    }
  }
);

export const saveDepartment = createAsyncThunk(
  'departments/saveDepartment',
  async ({ form, id }, { rejectWithValue }) => {
    try {
      const response = await saveDepartmentRequest(form, id);
      if (response?.dep_id) {
        return response;
      }
      return rejectWithValue(getErrorMessage(response, 'Failed to save department.'));
    } catch {
      return rejectWithValue('Failed to save department.');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteDepartmentRequest(id);
      if (response?.message || response?.code) {
        return rejectWithValue(getErrorMessage(response, 'Failed to delete department.'));
      }
      return id;
    } catch {
      return rejectWithValue('Failed to delete department.');
    }
  }
);

const initialState = {
  items: [],
  currentDepartment: null,
  loading: false,
  currentDepartmentLoading: false,
  saving: false,
  deleting: false,
  error: '',
  currentDepartmentError: '',
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = '';
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
      state.currentDepartmentError = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload || 'Failed to load departments.';
      })
      .addCase(fetchDepartmentById.pending, (state) => {
        state.currentDepartmentLoading = true;
        state.currentDepartmentError = '';
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.currentDepartmentLoading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.currentDepartmentLoading = false;
        state.currentDepartment = null;
        state.currentDepartmentError = action.payload || 'Failed to load department.';
      })
      .addCase(saveDepartment.pending, (state) => {
        state.saving = true;
        state.error = '';
        state.currentDepartmentError = '';
      })
      .addCase(saveDepartment.fulfilled, (state, action) => {
        const savedDepartment = action.payload;
        const index = state.items.findIndex((department) => department.dep_id === savedDepartment.dep_id);

        state.saving = false;
        state.currentDepartment = savedDepartment;

        if (index >= 0) {
          state.items[index] = savedDepartment;
        } else {
          state.items.push(savedDepartment);
          state.items.sort((a, b) => a.dep_id - b.dep_id);
        }
      })
      .addCase(saveDepartment.rejected, (state, action) => {
        state.saving = false;
        state.currentDepartmentError = action.payload || 'Failed to save department.';
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.deleting = true;
        state.error = '';
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((department) => department.dep_id !== action.payload);
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete department.';
      });
  }, 
});

export const { clearDepartmentError, clearCurrentDepartment } = departmentsSlice.actions;
export default departmentsSlice.reducer;
