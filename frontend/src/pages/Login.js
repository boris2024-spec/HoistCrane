import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography, Box, Alert,
    InputAdornment, IconButton, Chip, useMediaQuery
} from '@mui/material';
import {
    Visibility, VisibilityOff, AccountCircle, Lock,
    Security, Speed, CloudDone, Engineering,
    CheckCircleOutline, ArrowForward
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import HoistCraneLogo from '../components/Logo/HoistCraneLogo';

const floatKeyframes = {
    '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' },
    },
    '@keyframes floatSlow': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-15px) rotate(5deg)' },
    },
    '@keyframes pulse': {
        '0%, 100%': { opacity: 0.4 },
        '50%': { opacity: 0.8 },
    },
    '@keyframes slideUp': {
        '0%': { opacity: 0, transform: 'translateY(30px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
};

const FeatureItem = ({ icon, title, description }) => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box
            sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 0.3 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

const StatBadge = ({ value, label }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
            {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {label}
        </Typography>
    </Box>
);

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { mode } = useThemeMode();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isMobile = useMediaQuery('(max-width:960px)');

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
        <Box sx={{ minHeight: '100vh', display: 'flex', ...floatKeyframes }}>
            {/* Left Hero Panel */}
            {!isMobile && (
                <Box
                    sx={{
                        flex: '1 1 55%',
                        background: 'linear-gradient(160deg, #065f46 0%, #047857 25%, #059669 50%, #10b981 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        p: 6,
                    }}
                >
                    {/* Decorative floating shapes */}
                    <Box sx={{
                        position: 'absolute', top: '10%', right: '10%',
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        animation: 'float 6s ease-in-out infinite',
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: '15%', right: '20%',
                        width: 80, height: 80, borderRadius: '24%',
                        background: 'rgba(255,255,255,0.05)',
                        animation: 'floatSlow 8s ease-in-out infinite',
                    }} />
                    <Box sx={{
                        position: 'absolute', top: '40%', right: '5%',
                        width: 50, height: 50, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                        animation: 'float 10s ease-in-out infinite',
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: '5%', left: '10%',
                        width: 180, height: 180, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.03)',
                        animation: 'floatSlow 12s ease-in-out infinite',
                    }} />
                    {/* Grid pattern overlay */}
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520, animation: 'slideUp 0.8s ease-out' }}>
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <HoistCraneLogo size={56} />
                            <Box>
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.1 }}>
                                    Hoist & Crane
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.3 }}>
                                    Lifting Equipment Management
                                </Typography>
                            </Box>
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{
                                color: '#fff',
                                fontWeight: 800,
                                lineHeight: 1.2,
                                mb: 2,
                                fontSize: { md: '2rem', lg: '2.5rem' },
                            }}
                        >
                            מערכת חכמה לניהול
                            <br />
                            <Box component="span" sx={{ color: '#a7f3d0' }}>ציוד הרמה</Box>
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.7, maxWidth: 440 }}
                        >
                            נהלו את כל ציוד ההרמה שלכם במקום אחד — בדיקות תקופתיות,
                            תחזוקה, מסמכים, ודוחות מקצועיים בלחיצת כפתור.
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5 }}>
                            <FeatureItem
                                icon={<Security sx={{ color: '#a7f3d0' }} />}
                                title="ניהול בדיקות תקופתיות"
                                description="מעקב אוטומטי אחרי תאריכי בדיקה ותקינות ציוד"
                            />
                            <FeatureItem
                                icon={<Speed sx={{ color: '#a7f3d0' }} />}
                                title="דוחות מיידיים"
                                description="יצירת דוחות PDF מקצועיים בלחיצה אחת"
                            />
                            <FeatureItem
                                icon={<CloudDone sx={{ color: '#a7f3d0' }} />}
                                title="ענן מאובטח"
                                description="כל המידע שלכם מאובטח ונגיש מכל מקום"
                            />
                            <FeatureItem
                                icon={<Engineering sx={{ color: '#a7f3d0' }} />}
                                title="ניהול ספקים ותחזוקה"
                                description="תזמון עבודות תחזוקה ומעקב ביצוע"
                            />
                        </Box>

                        {/* Stats bar */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 4,
                                p: 2.5,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            <StatBadge value="500+" label="חברות" />
                            <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.15)' }} />
                            <StatBadge value="10K+" label="ציוד מנוהל" />
                            <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.15)' }} />
                            <StatBadge value="99.9%" label="זמינות" />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Right Login Panel */}
            <Box
                sx={{
                    flex: isMobile ? '1' : '1 1 45%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: mode === 'dark'
                        ? 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)'
                        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 3,
                }}
            >
                {/* Subtle background decorations */}
                <Box sx={{
                    position: 'absolute', top: -100, right: -100,
                    width: 300, height: 300, borderRadius: '50%',
                    background: mode === 'dark'
                        ? 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -80, left: -80,
                    width: 250, height: 250, borderRadius: '50%',
                    background: mode === 'dark'
                        ? 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
                    animation: 'pulse 6s ease-in-out infinite 1s',
                }} />

                <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ maxWidth: 420, mx: 'auto' }}>
                        {/* Mobile logo */}
                        {isMobile && (
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <HoistCraneLogo size={64} />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 800, mt: 1,
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Hoist & Crane
                                </Typography>
                            </Box>
                        )}

                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3.5, sm: 5 },
                                borderRadius: 4,
                                bgcolor: mode === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.85)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid',
                                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                boxShadow: mode === 'dark'
                                    ? '0 25px 50px rgba(0,0,0,0.4)'
                                    : '0 25px 50px rgba(0,0,0,0.08)',
                            }}
                        >
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Chip
                                    icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                                    label="גישה מאובטחת"
                                    size="small"
                                    sx={{
                                        mb: 2.5,
                                        bgcolor: mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                                        color: '#10b981',
                                        fontWeight: 600,
                                        border: '1px solid',
                                        borderColor: mode === 'dark' ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
                                        '& .MuiChip-icon': { color: '#10b981' },
                                    }}
                                />
                                <Typography
                                    component="h1"
                                    variant="h5"
                                    sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
                                >
                                    התחברות למערכת
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    הזינו את פרטי המשתמש שלכם כדי להמשיך
                                </Typography>
                            </Box>

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3, borderRadius: 2,
                                        '& .MuiAlert-icon': { alignItems: 'center' },
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

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
                                                <AccountCircle sx={{ color: '#10b981' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2.5,
                                            transition: 'box-shadow 0.2s',
                                            '&.Mui-focused': {
                                                boxShadow: '0 0 0 3px rgba(16,185,129,0.15)',
                                            },
                                        },
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
                                                <Lock sx={{ color: '#10b981' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2.5,
                                            transition: 'box-shadow 0.2s',
                                            '&.Mui-focused': {
                                                boxShadow: '0 0 0 3px rgba(16,185,129,0.15)',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    endIcon={!loading && <ArrowForward />}
                                    sx={{
                                        mt: 3.5,
                                        mb: 2,
                                        py: 1.6,
                                        borderRadius: 2.5,
                                        fontSize: '1.05rem',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                            boxShadow: '0 8px 28px rgba(16,185,129,0.45)',
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)',
                                        },
                                    }}
                                >
                                    {loading ? 'מתחבר...' : 'התחבר למערכת'}
                                </Button>

                                <Box
                                    sx={{
                                        mt: 3,
                                        pt: 3,
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        אין לך חשבון?{' '}
                                        <Link
                                            to="/signup"
                                            style={{
                                                color: '#10b981',
                                                fontWeight: 700,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            הירשם עכשיו
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Bottom trust indicators */}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Lock sx={{ fontSize: 14 }} />
                                חיבור מאובטח ומוצפן SSL
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Login;
