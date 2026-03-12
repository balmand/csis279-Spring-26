import { useEffect, useState } from 'react';
import moment from 'moment';
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
import { getEmployees, deleteEmployee } from '../services/employees.service';
import { getDepartments } from '../../departments/services/departments.service';
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

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
    try {
      const data = await getEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
        return;
      }
      setEmployees([]);
      setError(data?.message || 'Failed to load employees.');
    } catch {
      setEmployees([]);
      setError('Failed to load employees.');
    }
  };

  const remove = async (id) => {
    const response = await deleteEmployee(id);
    if (response?.code || response?.message) {
      setError(response?.message || 'Failed to delete employee.');
      return;
    }
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
              <TableCell>{moment(e.employee_dob).format('YYYY-MM-DD')}</TableCell>
              <TableCell>{getDepartmentName(e.employee_department)}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button component={Link} to={`/employees/${e.employee_id}/edit`} variant="outlined" size="small">
                    Edit
                  </Button>
                  <Button onClick={() => remove(e.employee_id)} variant="contained" color="error" size="small">
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

export default EmployeeList;
