import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid, Divider,
    Avatar, Alert, Tab, Tabs, IconButton, InputAdornment,
    Card, CardContent, Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Work as WorkIcon,
    Lock as LockIcon,
    Visibility, VisibilityOff,
    Save as SaveIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

const ROLE_LABELS = {
    admin: 'מנהל',
    manager: 'מנהל צוות',
    technician: 'טכנאי',
    viewer: 'צופה',
};

export default function MyProfile() {
    const { user, login } = useAuth();
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Profile form
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        language: 'he',
    });

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getProfile();
            const data = response.data;
            setForm({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                job_title: data.job_title || '',
                language: data.language || 'he',
            });
        } catch (err) {
            setError('שגיאה בטעינת הפרופיל');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await userAPI.updateProfile(form);
            setSuccess('הפרופיל עודכן בהצלחה');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'שגיאה בשמירת הפרופיל');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setError('');
        setSuccess('');

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError('הסיסמאות אינן תואמות');
            return;
        }
        if (passwordForm.new_password.length < 8) {
            setError('הסיסמה חייבת להכיל לפחות 8 תווים');
            return;
        }

        try {
            setSaving(true);
            await userAPI.changePassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password,
            });
            setSuccess('הסיסמה שונתה בהצלחה');
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.old_password) {
                setError(errorData.old_password);
            } else {
                setError(errorData?.detail || 'שגיאה בשינוי הסיסמה');
            }
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        const first = form.first_name?.[0] || '';
        const last = form.last_name?.[0] || '';
        return (first + last).toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
    };

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            {/* Header Card */}
            <Paper sx={{ p: 4, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{
                        width: 80, height: 80, fontSize: 32,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '3px solid rgba(255,255,255,0.5)',
                    }}>
                        {getInitials()}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {form.first_name || form.last_name
                                ? `${form.first_name} ${form.last_name}`.trim()
                                : user?.username}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                            {user?.email}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip
                                label={ROLE_LABELS[user?.role] || user?.role}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            {user?.company_name && (
                                <Chip
                                    icon={<BusinessIcon sx={{ color: 'white !important' }} />}
                                    label={user.company_name}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ borderRadius: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab icon={<PersonIcon />} iconPosition="start" label="פרטים אישיים" />
                    <Tab icon={<LockIcon />} iconPosition="start" label="שינוי סיסמה" />
                </Tabs>

                {/* Tab 0 - Personal Details */}
                <TabPanel value={tab} index={0}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="שם פרטי"
                                    value={form.first_name}
                                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="שם משפחה"
                                    value={form.last_name}
                                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="אימייל"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="טלפון"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="תפקיד"
                                    value={form.job_title}
                                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <WorkIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ height: '100%' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '16px !important' }}>
                                        <Typography variant="body2" color="text.secondary">שם משתמש:</Typography>
                                        <Typography variant="body1" fontWeight="bold">{user?.username}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveProfile}
                                disabled={saving}
                                size="large"
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                {saving ? 'שומר...' : 'שמור שינויים'}
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Tab 1 - Change Password */}
                <TabPanel value={tab} index={1}>
                    <Box sx={{ px: 3, pb: 3, maxWidth: 500 }}>
                        <TextField
                            fullWidth
                            label="סיסמה נוכחית"
                            type={showOld ? 'text' : 'password'}
                            value={passwordForm.old_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowOld(!showOld)} edge="end">
                                            {showOld ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="סיסמה חדשה"
                            type={showNew ? 'text' : 'password'}
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                            sx={{ mb: 3 }}
                            helperText="לפחות 8 תווים"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                                            {showNew ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="אימות סיסמה חדשה"
                            type="password"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                            sx={{ mb: 3 }}
                            error={passwordForm.confirm_password !== '' && passwordForm.new_password !== passwordForm.confirm_password}
                            helperText={
                                passwordForm.confirm_password !== '' && passwordForm.new_password !== passwordForm.confirm_password
                                    ? 'הסיסמאות אינן תואמות'
                                    : ''
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<LockIcon />}
                            onClick={handleChangePassword}
                            disabled={saving || !passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password}
                            size="large"
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {saving ? 'משנה...' : 'שנה סיסמה'}
                        </Button>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
}
