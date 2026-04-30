import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  clearCurrentFeedback,
  fetchFeedbackById,
  saveFeedback,
} from "../../../store/slices/feedbackSlice";

const initialForm = {
  comment: "",
  rate: 5,
};

const FeedbackForm = () => {
  const [form, setForm] = useState(initialForm);

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentFeedback,
    currentFeedbackLoading,
    currentFeedbackError,
    saving,
    saveError,
  } = useSelector((state) => state.feedback);

  useEffect(() => {
    if (id) {
      dispatch(fetchFeedbackById(id));
      return;
    }

    dispatch(clearCurrentFeedback());
    setForm(initialForm);
  }, [dispatch, id]);

  useEffect(() => {
    if (currentFeedback && id) {
      setForm({
        comment: currentFeedback.comment || "",
        rate: currentFeedback.rate ?? 5,
      });
    }
  }, [currentFeedback, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const comment = form.comment.trim();
    const rate = Number(form.rate);

    if (!comment) {
      return;
    }

    if (Number.isNaN(rate) || rate < 0 || rate > 5) {
      return;
    }

    try {
      await dispatch(
        saveFeedback({
          form: {
            comment,
            rate,
          },
          id,
        })
      ).unwrap();

      navigate("/feedback");
    } catch {
      // Redux state already contains the error message.
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? "Edit" : "Add"} Feedback
      </Typography>

      {currentFeedbackLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Comment"
            placeholder="Write feedback comment"
            value={form.comment}
            onChange={(e) =>
              setForm({
                ...form,
                comment: e.target.value,
              })
            }
            required
            fullWidth
            multiline
            minRows={4}
          />

          <TextField
            select
            label="Rate"
            value={form.rate}
            onChange={(e) =>
              setForm({
                ...form,
                rate: Number(e.target.value),
              })
            }
            required
            fullWidth
          >
            {[0, 1, 2, 3, 4, 5].map((rate) => (
              <MenuItem key={rate} value={rate}>
                {rate}
              </MenuItem>
            ))}
          </TextField>

          {currentFeedbackError && (
            <Alert severity="error">{currentFeedbackError}</Alert>
          )}

          {saveError && <Alert severity="error">{saveError}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? <CircularProgress size={24} /> : id ? "Update" : "Add"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/feedback")}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

export default FeedbackForm;