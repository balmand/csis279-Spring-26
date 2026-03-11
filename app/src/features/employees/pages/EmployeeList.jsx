import { useEffect, useState } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
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

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const employees = await getEmployees();
    console.log(employees);
    setEmployees(employees);
  };

  const remove = async (id) => {
    await deleteEmployee(id);
    loadEmployees();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Employees</Typography>
        <Button component={Link} to="/employees/new" variant="contained">
          Add Employee
        </Button>
      </Stack>

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
              <TableCell>{e.employee_department}</TableCell>
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