import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import HoistCraneLogo from '../components/Logo/HoistCraneLogo';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { mode } = useThemeMode();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(credentials.username, credentials.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mode === 'dark'
                    ? 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%)'
                    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: mode === 'dark'
                        ? 'radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
                    top: '-250px',
                    right: '-250px',
                    borderRadius: '50%',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: mode === 'dark'
                        ? 'radial-gradient(circle, rgba(163, 230, 53, 0.1) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(132, 204, 22, 0.2) 0%, transparent 70%)',
                    bottom: '-200px',
                    left: '-200px',
                    borderRadius: '50%',
                },
            }}
        >
            <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={mode === 'dark' ? 8 : 4}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <HoistCraneLogo size={80} />
                        </Box>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                            }}
                        >
                            Hoist & Crane
                        </Typography>
                        <Typography variant="h6" color="text.primary" fontWeight={600}>
                            התחברות למערכת
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            ברוכים הבאים למערכת ניהול ציוד הרמה
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="שם משתמש"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={credentials.username}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="סיסמה"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    boxShadow: '0 8px 24px 0 rgba(74, 222, 128, 0.4)',
                                },
                            }}
                        >
                            {loading ? 'מתחבר...' : 'התחבר'}
                        </Button>
                        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                            אין לך חשבון?{' '}
                            <Link to="/signup" style={{ color: '#4ade80', fontWeight: 600, textDecoration: 'none' }}>
                                הירשם עכשיו
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
