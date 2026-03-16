import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getClients } from "../services/clientOrders.service.js";

const ClientListOrders = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load clients.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = (clientId) => {
    navigate(`/orders/${clientId}`);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Orders by Client</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <Typography sx={{ py: 2 }}>No clients found.</Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.client_id}>
                  <TableCell>{client.client_id}</TableCell>
                  <TableCell>{client.client_name}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleViewOrders(client.client_id)}
                      variant="outlined"
                      size="small"
                    >
                      View Orders
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};

export default ClientListOrders;
