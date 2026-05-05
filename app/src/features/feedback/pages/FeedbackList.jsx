import { useEffect } from "react";

import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  clearFeedbackErrors,
  deleteFeedback,
  fetchFeedbacks,
} from "../../../store/slices/feedbackSlice";

const FeedbackList = () => {
  const dispatch = useDispatch();

  const { items, loading, deleting, error, deleteError } = useSelector(
    (state) => state.feedback
  );

  useEffect(() => {
    dispatch(fetchFeedbacks());
  }, [dispatch]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmed) {
      return;
    }

    await dispatch(deleteFeedback(id));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5">Feedback</Typography>
          <Typography variant="body2" color="text.secondary">
            View, create, update, and delete customer feedback.
          </Typography>
        </Box>

        <Button
          variant="contained"
          component={Link}
          to="/feedback/new"
        >
          Add Feedback
        </Button>
      </Stack>

      {(error || deleteError) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearFeedbackErrors())}
        >
          {error || deleteError}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : items.length === 0 ? (
        <Alert severity="info">No feedback found.</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>{feedback.id}</TableCell>
                <TableCell>{feedback.comment}</TableCell>
                <TableCell>{feedback.rate}/5</TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`/feedback/${feedback.id}/edit`}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={deleting}
                      onClick={() => handleDelete(feedback.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default FeedbackList;