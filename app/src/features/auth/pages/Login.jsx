import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { login } from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
    const [form, setForm] = useState({ client_email: '', password: '' });
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const { ok, data } = await login(form);
        if (ok && data.authenticated) {
            signIn(data.client);
            navigate('/');
        } else {
            setError(data.message || 'Login failed.');
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 480 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Login
            </Typography>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
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
                    Login
                </Button>

                <Typography variant="body2">
                    Don&apos;t have an account?{' '}
                    <Link component={RouterLink} to="/register">
                        Register
                    </Link>
                </Typography>
            </Stack>
        </Paper>
    );
};

export default Login;
