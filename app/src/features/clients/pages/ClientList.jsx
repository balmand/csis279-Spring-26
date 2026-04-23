import { useEffect, useState } from "react";
import dayjs from "dayjs";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { sendClientEmail } from "../services/client.service";
import { SOCKET_ENABLED } from "../../../services/socket";
import {
  clearClientError,
  deleteClient,
  fetchClients,
  syncPendingChanges,
} from "../../../store/slices/clientsSlice";

const ClientList = () => {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const dispatch = useDispatch();
  const {
    items: clients,
    loading,
    deleting,
    error,
    socketConnected,
    isOffline,
    pendingChanges,
    syncingPending,
  } = useSelector((state) => state.clients);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const removeClient = async (id) => {
    try {
      await dispatch(deleteClient(id)).unwrap();
      setConfirmDelete(null);
    } catch {
      // Redux state already captures the error message.
    }
  };

  const handleOpenEmail = (client) => {
    setSelectedClient(client);
    setSubject("");
    setMessage("");
    setStatus("");
    setOpen(true);
  };

  const handleCloseEmail = () => {
    setOpen(false);
    setSelectedClient(null);
    setSubject("");
    setMessage("");
    setStatus("");
  };

  const handleSendEmail = async () => {
    try {
      await sendClientEmail({
        to: selectedClient.client_email,
        subject,
        text: message,
      });

      setStatus("sent");
    } catch (error) {
      setStatus("failed");
      console.error(error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Client List</Typography>
        <Button component={Link} variant="contained" to="/clients/new">
          Create
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearClientError())}>
          {error}
        </Alert>
      )}

      {isOffline ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Offline mode is active. You can keep editing clients, and {pendingChanges.length} change
          {pendingChanges.length === 1 ? "" : "s"} will sync automatically when you reconnect.
        </Alert>
      ) : pendingChanges.length > 0 ? (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              disabled={syncingPending}
              onClick={() => dispatch(syncPendingChanges())}
            >
              {syncingPending ? "Syncing..." : "Sync now"}
            </Button>
          }
        >
          {pendingChanges.length} pending offline change{pendingChanges.length === 1 ? "" : "s"} waiting
          to sync.
        </Alert>
      ) : null}

      {SOCKET_ENABLED ? (
        <Alert severity={socketConnected ? "success" : "warning"} sx={{ mb: 2 }}>
          {socketConnected
            ? "Live sync is connected. Client changes from other sessions will appear automatically."
            : "Live sync is disconnected. Realtime updates will resume when the socket reconnects."}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          No clients found.
        </Typography>
      ) : (
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.client_id}>
                <TableCell>{client.client_id}</TableCell>
                <TableCell>{client.client_name}</TableCell>
                <TableCell>{client.client_email}</TableCell>
                <TableCell>
                  {client.client_dob ? dayjs(client.client_dob).format("YYYY-MM-DD") : "—"}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component={Link}
                      to={`/clients/${client.client_id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => setConfirmDelete(client)}
                      variant="contained"
                      color="error"
                      size="small"
                    >
                      Delete
                    </Button>

                    <Button
                      onClick={() => handleOpenEmail(client)}
                      variant="contained"
                      size="small"
                    >
                      Send Email
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      )}

      <Dialog open={open} onClose={handleCloseEmail} fullWidth maxWidth="sm">
        <DialogTitle>Send Email</DialogTitle>

        <DialogContent>
          <TextField
            label="To"
            fullWidth
            margin="dense"
            value={selectedClient?.client_email || ""}
            disabled
          />

          <TextField
            label="Subject"
            fullWidth
            margin="dense"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <TextField
            label="Message"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {status === "sent" && (
            <Typography sx={{ mt: 2, color: "green" }}>
              Email sent successfully
            </Typography>
          )}

          {status === "failed" && (
            <Typography sx={{ mt: 2, color: "red" }}>
              Failed to send email
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEmail}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{confirmDelete?.client_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button
            onClick={() => removeClient(confirmDelete?.client_id)}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ClientList;
