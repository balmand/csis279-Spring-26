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
  Typography,
} from '@mui/material';
import { getDepartments, deleteDepartment } from '../services/departments.service';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDep();
  }, []);

  const loadDep = async () => {
    try {
      const deps = await getDepartments();
      if (Array.isArray(deps)) {
        setDepartments(deps);
        return;
      }
      setDepartments([]);
      setError(deps?.message || 'Failed to load departments.');
    } catch {
      setDepartments([]);
      setError('Failed to load departments.');
    }
  };

  const remove = async (id) => {
    const response = await deleteDepartment(id);
    if (response?.code || response?.message) {
      setError(response?.message || 'Failed to delete department.');
      return;
    }
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
                  <Button onClick={() => remove(d.dep_id)} variant="contained" color="error" size="small">
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

export default DepartmentList;
