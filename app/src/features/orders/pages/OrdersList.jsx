import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { getOrders } from "../services/orders.service.js";

const OrdersList = () => {
  const { id } = useParams(); // Retrieve the client ID from the route
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (id) {
      loadOrders(id);
    }
  }, [id]);

  const loadOrders = async (id) => {
    const data = await getOrders(id); // Fetch orders for the client
    setOrders(data);
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
                    to={`/itemsList/${order.order_id}`}
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
    </Paper>
  );
};

export default OrdersList;
