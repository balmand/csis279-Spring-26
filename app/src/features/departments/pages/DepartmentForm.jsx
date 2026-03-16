import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { getDepartment, saveDepartment } from '../services/departments.service';

const DepartmentForm = () => {
  const [form, setForm] = useState({ name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadDepartment(id);
  }, [id]);

  const loadDepartment = async (departmentId) => {
    setLoading(true);
    try {
      const res = await getDepartment(departmentId);
      if (res?.code || res?.message) {
        setError(res?.message || 'Failed to load department.');
        return;
      }
      setForm({ name: res.dep_name });
    } catch {
      setError('Failed to load department.');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await saveDepartment(form, id);
      if (response?.code || response?.message) {
        setError(response?.message || 'Failed to save department.');
        return;
      }
      navigate('/departments');
    } catch {
      setError('Failed to save department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Department
      </Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      <Stack component="form" spacing={2} onSubmit={submit}>
        <TextField
          label="Department Name"
          placeholder="Department name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default DepartmentForm;
