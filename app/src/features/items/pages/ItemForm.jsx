import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { getItem, saveItem } from '../services/items.service';

const ItemForm = () => {
  const [form, setForm] = useState({
    item_name: '',
    item_sku: '',
    unit_price: '',
    stock_quantity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadItem(id);
  }, [id]);

  const loadItem = async (item_id) => {
    try {
      const res = await getItem(item_id);
      setForm({
        item_name: res.item_name,
        item_sku: res.item_sku,
        unit_price: res.unit_price,
        stock_quantity: res.stock_quantity,
      });
    } catch {
      setError('Failed to load item.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await saveItem({
        item_name: form.item_name,
        item_sku: form.item_sku,
        unit_price: parseFloat(form.unit_price),
        stock_quantity: parseInt(form.stock_quantity),
      }, id);
      if (response?.code || response?.message) {
        setError(response?.message || 'Failed to save item.');
        setLoading(false);
        return;
      }
      navigate('/items');
    } catch {
      setError('Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Item
      </Typography>
      <Stack component="form" spacing={2} onSubmit={submit}>
        <TextField
          label="Item Name"
          name="item_name"
          value={form.item_name}
          onChange={handleChange}
          required
        />
        <TextField
          label="SKU"
          name="item_sku"
          value={form.item_sku}
          onChange={handleChange}
          required
        />
        <TextField
          label="Unit Price"
          name="unit_price"
          type="number"
          value={form.unit_price}
          onChange={handleChange}
          required
        />
        <TextField
          label="Stock Quantity"
          name="stock_quantity"
          type="number"
          value={form.stock_quantity}
          onChange={handleChange}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ItemForm;