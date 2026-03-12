import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getItems, deleteItem, adjustStock } from '../services/items.service';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getItems();
    setItems(data);
  };

  const remove = async (id) => {
    await deleteItem(id);
    loadItems();
  };

  const handleQuantityChange = (id, value) => {
    setQuantities({ ...quantities, [id]: value });
  };

  const handleAdjustStock = async (id, type) => {
    const qty = parseInt(quantities[id]);
    if (!qty || qty <= 0) return;

    const change = type === 'decrease' ? -qty : qty;

    const currentStock = items.find(i => i.item_id === id)?.stock_quantity ?? 0;
    if (type === 'decrease' && qty > currentStock) return;

    await adjustStock(id, change);
    setQuantities({ ...quantities, [id]: '' });
    loadItems();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Items</Typography>
        <Button component={Link} to="/items/new" variant="contained">
          Add Items
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Adjust Stock</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((i) => (
            <TableRow key={i.item_id}>

              <TableCell>{i.item_name}</TableCell>

              <TableCell>
                {i.stock_quantity < 5 ? (
                  <Alert severity="warning" sx={{ py: 0, px: 1 }}>
                    Low: {i.stock_quantity}
                  </Alert>
                ) : (
                  i.stock_quantity
                )}
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Qty"
                    value={quantities[i.item_id] || ''}
                    onChange={(e) => handleQuantityChange(i.item_id, e.target.value)}
                    sx={{ width: 80 }}
                    inputProps={{ min: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => handleAdjustStock(i.item_id, 'increase')}
                  >
                    + Add
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    onClick={() => handleAdjustStock(i.item_id, 'decrease')}
                    disabled={i.stock_quantity === 0}
                  >
                    − Remove
                  </Button>
                </Stack>
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button component={Link} to={`/items/${i.item_id}/edit`} variant="outlined" size="small">
                    Edit
                  </Button>
                  <Button onClick={() => remove(i.item_id)} variant="contained" color="error" size="small">
                    Delete
                  </Button>
                </Stack>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default ItemList;