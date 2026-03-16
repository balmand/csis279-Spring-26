import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getDepartments, deleteDepartment } from '../services/departments.service';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadDep();
  }, []);

  const loadDep = async () => {
    setLoading(true);
    try {
      const deps = await getDepartments();
      if (Array.isArray(deps)) {
        setDepartments(deps);
        setError('');
        return;
      }
      setDepartments([]);
      setError(deps?.message || 'Failed to load departments.');
    } catch {
      setDepartments([]);
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    const response = await deleteDepartment(id);
    if (response?.code || response?.message) {
      setError(response?.message || 'Failed to delete department.');
      setConfirmDelete(null);
      return;
    }
    setConfirmDelete(null);
    await loadDep();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Departments</Typography>
        <Button component={Link} to="/departments/new" variant="contained">
          Add Department
        </Button>
      </Stack>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : departments.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No departments found.
        </Typography>
      ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departments.map((d) => (
            <TableRow key={d.dep_id}>
              <TableCell>{d.dep_name}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button component={Link} to={`/departments/${d.dep_id}/edit`} variant="outlined" size="small">
                    Edit
                  </Button>
                  <Button onClick={() => setConfirmDelete(d)} variant="contained" color="error" size="small">
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{confirmDelete?.dep_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={() => remove(confirmDelete?.dep_id)} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DepartmentList;
