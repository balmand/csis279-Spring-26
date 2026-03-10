import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { register } from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({
        client_name: '',
        client_email: '',
        client_dob: '',
        password: '',
    });
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const { ok, data } = await register(form);
        if (ok) {
            signIn(data);
            navigate('/');
        } else {
            setError(data.message || 'Registration failed.');
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 480 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Register
            </Typography>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                <TextField
                    label="Full Name"
                    name="client_name"
                    value={form.client_name}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Email"
                    name="client_email"
                    type="email"
                    value={form.client_email}
                    onChange={handleChange}
                    required
                    fullWidth
                />
                <TextField
                    label="Date of Birth"
                    name="client_dob"
                    type="date"
                    value={form.client_dob}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button type="submit" variant="contained">
                    Register
                </Button>

                <Typography variant="body2">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login">
                        Login
                    </Link>
                </Typography>
            </Stack>
        </Paper>
    );
};

export default Register;
