import { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";

import {
  Box,
  Button,
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

import {
  deleteUser,
  getClients,
  sendClientEmail,
} from "../services/client.service";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  const removeClient = async (id) => {
    await deleteUser(id);
    loadClients();
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
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <Button component={Link} variant="contained" to="/clients/new">
          Create
        </Button>

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
                  {moment(client.client_dob).format("YYYY-MM-DD")}
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
                      onClick={() => removeClient(client.client_id)}
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
    </Paper>
  );
};

export default ClientList;