import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  deleteFeedback as deleteFeedbackRequest,
  getFeedback,
  getFeedbacks,
  saveFeedback as saveFeedbackRequest,
} from "../../features/feedback/services/feedback.service";

const getErrorMessage = (response, fallback) => {
  if (response?.message) {
    return response.message;
  }

  if (response?.code && typeof response.code === "string") {
    return response.code;
  }

  return fallback;
};

const initialState = {
  items: [],
  currentFeedback: null,

  loading: false,
  currentFeedbackLoading: false,
  saving: false,
  deleting: false,

  error: null,
  currentFeedbackError: null,
  saveError: null,
  deleteError: null,
};

export const fetchFeedbacks = createAsyncThunk(
  "feedback/fetchFeedbacks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFeedbacks();

      if (Array.isArray(response)) {
        return response;
      }

      return rejectWithValue(
        getErrorMessage(response, "Failed to load feedback.")
      );
    } catch {
      return rejectWithValue("Failed to load feedback.");
    }
  }
);

export const fetchFeedbackById = createAsyncThunk(
  "feedback/fetchFeedbackById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getFeedback(id);

      if (response?.id) {
        return response;
      }

      return rejectWithValue(
        getErrorMessage(response, "Failed to load feedback.")
      );
    } catch {
      return rejectWithValue("Failed to load feedback.");
    }
  }
);

export const saveFeedback = createAsyncThunk(
  "feedback/saveFeedback",
  async ({ form, id }, { rejectWithValue }) => {
    try {
      const payload = {
        comment: form.comment.trim(),
        rate: Number(form.rate),
      };

      const response = await saveFeedbackRequest(payload, id);

      if (response?.id) {
        return response;
      }

      return rejectWithValue(
        getErrorMessage(response, "Failed to save feedback.")
      );
    } catch {
      return rejectWithValue("Failed to save feedback.");
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  "feedback/deleteFeedback",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteFeedbackRequest(id);

      if (response?.success) {
        return Number(id);
      }

      return rejectWithValue(
        getErrorMessage(response, "Failed to delete feedback.")
      );
    } catch {
      return rejectWithValue("Failed to delete feedback.");
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    clearCurrentFeedback(state) {
      state.currentFeedback = null;
      state.currentFeedbackError = null;
      state.saveError = null;
    },

    clearFeedbackErrors(state) {
      state.error = null;
      state.currentFeedbackError = null;
      state.saveError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load feedback.";
      })

      .addCase(fetchFeedbackById.pending, (state) => {
        state.currentFeedbackLoading = true;
        state.currentFeedbackError = null;
        state.currentFeedback = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action) => {
        state.currentFeedbackLoading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.currentFeedbackLoading = false;
        state.currentFeedbackError =
          action.payload || "Failed to load feedback.";
      })

      .addCase(saveFeedback.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveFeedback.fulfilled, (state, action) => {
        state.saving = false;

        const savedFeedback = action.payload;
        const existingIndex = state.items.findIndex(
          (feedback) => feedback.id === savedFeedback.id
        );

        if (existingIndex >= 0) {
          state.items[existingIndex] = savedFeedback;
        } else {
          state.items.push(savedFeedback);
        }

        state.currentFeedback = savedFeedback;
      })
      .addCase(saveFeedback.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to save feedback.";
      })

      .addCase(deleteFeedback.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(
          (feedback) => feedback.id !== action.payload
        );

        if (state.currentFeedback?.id === action.payload) {
          state.currentFeedback = null;
        }
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Failed to delete feedback.";
      });
  },
});

export const { clearCurrentFeedback, clearFeedbackErrors } =
  feedbackSlice.actions;

export default feedbackSlice.reducer;