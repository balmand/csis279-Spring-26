import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { getClient, saveClient } from '../services/client.service';

const ClientForm = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(id);  
    if (id) {
      loadClient(id);
    }
  }, [id]);

  const loadClient = async(id) =>{
    const data = await getClient(id);
    setForm({name: data.client_name, email:data.client_email});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveClient(form, id);
    navigate('/clients');
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

        <Alert severity="info">We'll never share your email with anyone else.</Alert>

        <Button type="submit" variant="contained">
          {id ? 'Update' : 'Add'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default ClientForm;
