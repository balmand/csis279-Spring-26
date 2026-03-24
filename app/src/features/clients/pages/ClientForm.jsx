import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import {
  clearCurrentClient,
  fetchClientById,
  saveClient,
} from '../../../store/slices/clientsSlice';

const ClientForm = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentClient, currentClientLoading, currentClientError, saving } = useSelector((state) => state.clients);

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(id));
      return;
    }
    dispatch(clearCurrentClient());
    setForm({ name: '', email: '' });
  }, [dispatch, id]);

  useEffect(() => {
    if (currentClient && id) {
      setForm({ name: currentClient.client_name, email: currentClient.client_email });
    }
  }, [currentClient, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(saveClient({ form, id })).unwrap();
      navigate('/clients');
    } catch {
      // Redux state already captures the error message.
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Client
      </Typography>

      {currentClientLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
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

        {currentClientError && <Alert severity="error">{currentClientError}</Alert>}

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : id ? 'Update' : 'Add'}
        </Button>
      </Stack>
      )}
    </Paper>
  );
};

export default ClientForm;
