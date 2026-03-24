import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCurrentDepartment,
  fetchDepartmentById,
  saveDepartment,
} from '../../../store/slices/departementSlice';

const DepartmentForm = () => {
  const [form, setForm] = useState({ name: '' });
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentDepartment, currentDepartmentLoading, currentDepartmentError, saving } = useSelector((state) => state.departments);

  useEffect(() => {
    if (id) {
      dispatch(fetchDepartmentById(id));
      return;
    }
    dispatch(clearCurrentDepartment());
    setForm({ name: '' });
  }, [dispatch, id]);

  useEffect(() => {
    if (currentDepartment && id) {
      setForm({ name: currentDepartment.dep_name });
    }
  }, [currentDepartment, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(saveDepartment({ form, id })).unwrap();
      navigate('/departments');
    } catch {
      // Redux state already captures the error message.
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Department
      </Typography>

      {currentDepartmentLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Department Name"
            placeholder="Department name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            fullWidth
          />

          {currentDepartmentError && <Alert severity="error">{currentDepartmentError}</Alert>}

          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : id ? 'Update' : 'Add'}
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default DepartmentForm;
