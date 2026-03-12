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
import { getOrderItems } from "../services/itemsInOrder.service.js";

const ItemsList = () => {
  const [orderItems, setOrderItems] = useState([]);
  const { id } = useParams(); // Retrieve the client ID from the route

  useEffect(() => {
    loadOrderItems();
  }, []);

  const loadOrderItems = async () => {
    try {
      const data = await getOrderItems(id); // Fetch order items
      setOrderItems(Array.isArray(data) ? data : []); // Ensure data is an array
    } catch (error) {
      console.error("Failed to load order items:", error);
      setOrderItems([]); // Set to empty array on error
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

      <Box sx={{ overflowX: "auto" }}>
        {orderItems.length === 0 ? (
          <Typography>No items found for this order.</Typography>
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
    </Paper>
  );
};

export default ItemsList;
