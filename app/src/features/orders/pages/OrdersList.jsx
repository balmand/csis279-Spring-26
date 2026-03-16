import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
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
import { getOrders } from "../services/orders.service.js";

const OrdersList = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadOrders(id);
    }
  }, [id]);

  const loadOrders = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrders(id);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
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
        <Typography variant="h5">Orders for Client {id}</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography sx={{ py: 2 }}>No orders found for this client.</Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.order_date}</TableCell>
                  <TableCell>{order.order_total}</TableCell>
                  <TableCell>{order.order_status}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/orders/${order.order_id}/items`}
                      variant="outlined"
                      size="small"
                    >
                      View Order Details
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

export default OrdersList;
