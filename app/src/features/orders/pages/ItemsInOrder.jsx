import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
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
import { getOrderItems } from "../services/itemsInOrder.service.js";

const ItemsList = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    loadOrderItems();
  }, [id]);

  const loadOrderItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderItems(id);
      setOrderItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load order items.');
      setOrderItems([]);
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
        <Typography variant="h5">Order {id} Details</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          {orderItems.length === 0 ? (
            <Typography sx={{ py: 2 }}>No items found for this order.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>ORDER ID</TableCell>
                  <TableCell>ITEM ID</TableCell>
                  <TableCell>QUANTITY</TableCell>
                  <TableCell>UNIT PRICE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((orderItem) => (
                  <TableRow key={orderItem.order_item_id}>
                    <TableCell>{orderItem.order_item_id}</TableCell>
                    <TableCell>{orderItem.order_id}</TableCell>
                    <TableCell>{orderItem.item_id}</TableCell>
                    <TableCell>{orderItem.quantity}</TableCell>
                    <TableCell>{orderItem.unit_price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ItemsList;
