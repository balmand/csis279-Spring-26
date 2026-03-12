import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Paper, Stack, TextField, Typography, MenuItem } from '@mui/material';
import { getEmployee, saveEmployee } from '../services/employees.service';
import { getDepartments } from '../../departments/services/departments.service';
const EmployeeForm = () => {
  const [form, setForm] = useState({ employee_name: '', employee_email: '', employee_role: '', employee_dob: '', employee_department: '' });
  const [departments, setDepartments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadDepartments();
    if (id) { 
      loadEmployee(id);
      
    }
  }, [id]);

  const loadEmployee = async (id) => {
    const res = await getEmployee(id);
    setForm({ employee_name: res.employee_name, employee_email: res.employee_email, employee_role: res.employee_role, employee_dob: res.employee_dob, employee_department: res.employee_department });
  };

  const submit = async (e) => {
    e.preventDefault();
    await saveEmployee(form, id);
    navigate('/employees');
  };

  const loadDepartments = async () => {
    try {
        const deptData = await getDepartments();
        setDepartments(deptData);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {id ? 'Edit' : 'Add'} Employee
      </Typography>
      <Stack component="form" spacing={2} onSubmit={submit}>
        <TextField
          label="Employee name"
          placeholder="Employee name"
          value={form.employee_name}
          onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
          required
        />
        <TextField
          label="Employee email"
          placeholder="Employee email"
          value={form.employee_email}
          onChange={(e) => setForm({ ...form, employee_email: e.target.value })}
          required
        />
        <TextField
          label="Employee role"
          placeholder="Employee role"
          value={form.employee_role}
          onChange={(e) => setForm({ ...form, employee_role: e.target.value })}
          required
        />
        <TextField
          label="Employee dob"
          placeholder="Employee dob"
          type="date"
          value={form.employee_dob}
          onChange={(e) => setForm({ ...form, employee_dob: e.target.value })}
          required
        />
        <TextField
          select
          label="Employee department"
          placeholder="Employee department"
          value={form.employee_department}
          onChange={(e) => setForm({ ...form, employee_department: e.target.value })}
          required
        >
          {departments.map((option) => (
            <MenuItem key={option.dep_id} value={option.dep_id}>
              {option.dep_name}
            </MenuItem>
          ))}
          </TextField>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </Stack>
    </Paper>
  );
};

export default EmployeeForm;
