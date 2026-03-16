import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { getClient, saveClient } from '../services/client.service';

const ClientForm = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadClient(id);
    }
  }, [id]);

  const loadClient = async (id) => {
    try {
      const data = await getClient(id);
      setForm({ name: data.client_name, email: data.client_email });
    } catch {
      setError('Failed to load client.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await saveClient(form, id);
      if (response?.code || response?.message) {
        setError(response?.message || 'Failed to save client.');
        setLoading(false);
        return;
      }
      navigate('/clients');
    } catch {
      setError('Failed to save client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Client
      </Typography>

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Name"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          fullWidth
        />

        <TextField
          label="Email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          fullWidth
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : id ? 'Update' : 'Add'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ClientForm;
