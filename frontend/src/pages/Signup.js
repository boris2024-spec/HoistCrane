import React, { useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Alert,
    Container, Link as MuiLink, CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { tenantAPI } from '../services/api';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        company_name: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company_name || !form.email || !form.password) {
            setError('Please fill in all required fields');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const res = await tenantAPI.signup(form);
            const { tokens } = res.data;
            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);
            // Reload to get user context
            window.location.href = '/';
        } catch (err) {
            const data = err.response?.data;
            if (data?.email) {
                setError(Array.isArray(data.email) ? data.email[0] : data.email);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Create Account
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Start your 14-day free trial. No credit card required.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="Company Name" required sx={{ mb: 2 }}
                            value={form.company_name}
                            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth label="First Name"
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            />
                            <TextField
                                fullWidth label="Last Name"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            />
                        </Box>
                        <TextField
                            fullWidth label="Email" type="email" required sx={{ mb: 2 }}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Password" type="password" required sx={{ mb: 3 }}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            helperText="Minimum 8 characters"
                        />
                        <Button
                            fullWidth variant="contained" size="large" type="submit"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Start Free Trial'}
                        </Button>
                    </form>

                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <MuiLink component={Link} to="/login">Log in</MuiLink>
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
