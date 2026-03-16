import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
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
import { getEmployees, deleteEmployee } from '../services/employees.service';
import { getDepartments } from '../../departments/services/departments.service';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

   const loadDepartments = async () => {
    try {
        const deptData = await getDepartments();
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
          return;
        }
        setDepartments([]);
        setError(deptData?.message || 'Failed to load departments.');
      } catch {
        setDepartments([]);
        setError('Failed to load departments.');
      }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
        setError('');
        return;
      }
      setEmployees([]);
      setError(data?.message || 'Failed to load employees.');
    } catch {
      setEmployees([]);
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    const response = await deleteEmployee(id);
    if (response?.code || response?.message) {
      setError(response?.message || 'Failed to delete employee.');
      setConfirmDelete(null);
      return;
    }
    setConfirmDelete(null);
    await loadEmployees();
  };

  const getDepartmentName = (id) => {
    if (!id) {
      return '-';
    }
    const dept = departments.find((d) => d.dep_id === Number.parseInt(id, 10));
    return dept ? dept.dep_name : '-';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Employees</Typography>
        <Button component={Link} to="/employees/new" variant="contained">
          Add Employee
        </Button>
      </Stack>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : employees.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No employees found.
        </Typography>
      ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>DOB</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.employee_id}>
              <TableCell>{e.employee_name}</TableCell>
              <TableCell>{e.employee_email}</TableCell>
              <TableCell>{e.employee_role}</TableCell>
              <TableCell>{e.employee_dob ? dayjs(e.employee_dob).format('YYYY-MM-DD') : '—'}</TableCell>
              <TableCell>{getDepartmentName(e.employee_department)}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button component={Link} to={`/employees/${e.employee_id}/edit`} variant="outlined" size="small">
                    Edit
                  </Button>
                  <Button onClick={() => setConfirmDelete(e)} variant="contained" color="error" size="small">
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
            Are you sure you want to delete <strong>{confirmDelete?.employee_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={() => remove(confirmDelete?.employee_id)} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EmployeeList;
