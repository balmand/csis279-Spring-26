import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { login } from '../services/auth.service';
import { useAuth } from '../../../store/hooks/useAuth';

const Login = () => {
    const [form, setForm] = useState({ client_email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { ok, data } = await login(form);
            if (ok && data.authenticated) {
                signIn(data.client);
                navigate('/');
            } else {
                setError(data?.message || 'Login failed.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Paper sx={{ p: 3, maxWidth: 480, minWidth: 450 }}>
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

                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>

                    <Typography variant="body2">
                        Don&apos;t have an account?{' '}
                        <Link component={RouterLink} to="/register">
                            Register
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Login;
