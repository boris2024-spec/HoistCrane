import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Alert,
    Container, CircularProgress, Chip,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { tenantAPI } from '../services/api';

export default function AcceptInvitation() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [invitation, setInvitation] = useState(null);
    const [form, setForm] = useState({
        password: '',
        first_name: '',
        last_name: '',
    });

    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setError('No invitation token provided.');
            setLoading(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const validateToken = async () => {
        try {
            const res = await tenantAPI.validateInvitation(token);
            if (res.data.valid) {
                setInvitation(res.data);
            } else {
                setError(res.data.detail || 'Invalid invitation.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired invitation.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.password || form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        try {
            setSubmitting(true);
            setError('');
            const res = await tenantAPI.acceptInvitation({
                token,
                ...form,
            });
            const { tokens } = res.data;
            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.token?.[0] || err.response?.data?.detail || 'Failed to accept invitation.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Join {invitation?.company_name || 'Company'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {invitation && (
                        <>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="body1" color="text.secondary">
                                    You've been invited as
                                </Typography>
                                <Chip label={invitation.role} color="primary" sx={{ mt: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {invitation.email}
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
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
                                    fullWidth label="Password" type="password" required sx={{ mb: 3 }}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    helperText="Minimum 8 characters"
                                />
                                <Button
                                    fullWidth variant="contained" size="large" type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? <CircularProgress size={24} /> : 'Accept & Join'}
                                </Button>
                            </form>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
