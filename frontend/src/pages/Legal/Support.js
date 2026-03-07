import React, { useState } from 'react';
import {
    Container, Paper, Typography, Box, Divider, TextField, Button,
    Grid, Card, CardContent, Snackbar, Alert, Chip
} from '@mui/material';
import {
    SupportAgent as SupportIcon, Phone as PhoneIcon, Email as EmailIcon,
    AccessTime as TimeIcon, Send as SendIcon, HelpOutline as HelpIcon,
    Build as BuildIcon, BugReport as BugIcon, School as SchoolIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

const Support = () => {
    const { mode } = useThemeMode();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Build mailto link
        const mailtoSubject = encodeURIComponent(`[תמיכה] ${formData.subject}`);
        const mailtoBody = encodeURIComponent(
            `שם: ${formData.name}\nדוא"ל: ${formData.email}\n\n${formData.message}`
        );
        window.location.href = `mailto:boriaa85@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
        setSnackbar({ open: true, message: 'מעביר ללקוח הדוא"ל שלך...', severity: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const cardStyle = {
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark'
                ? '0 12px 40px rgba(74, 222, 128, 0.1)'
                : '0 12px 40px rgba(34, 197, 94, 0.12)',
            borderColor: 'primary.main',
        },
    };

    const supportCategories = [
        {
            icon: <BuildIcon sx={{ fontSize: 32 }} />,
            title: 'תמיכה טכנית',
            description: 'סיוע בתקלות טכניות, בעיות גישה והגדרות מערכת',
        },
        {
            icon: <BugIcon sx={{ fontSize: 32 }} />,
            title: 'דיווח על באג',
            description: 'דיווח על שגיאות, תקלות או התנהגות לא צפויה במערכת',
        },
        {
            icon: <HelpIcon sx={{ fontSize: 32 }} />,
            title: 'שאלות כלליות',
            description: 'שאלות לגבי תכונות המערכת, הרשאות ופונקציונליות',
        },
        {
            icon: <SchoolIcon sx={{ fontSize: 32 }} />,
            title: 'הדרכה והטמעה',
            description: 'בקשות להדרכה, הטמעת מערכת ושילוב עם מערכות קיימות',
        },
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Paper
                elevation={mode === 'dark' ? 4 : 2}
                sx={{
                    p: { xs: 3, sm: 5, md: 6 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 4,
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
                        background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(74, 222, 128, 0.3)',
                    }}>
                        <SupportIcon sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        מרכז תמיכה
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 500, mx: 'auto' }}>
                        צוות התמיכה שלנו זמין לסייע לך בכל שאלה או בעיה. אנו מתחייבים למענה מקצועי ומהיר.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Contact Info Cards */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={4}>
                        <Card elevation={0} sx={cardStyle}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Box sx={{
                                    width: 50, height: 50, borderRadius: '50%', mx: 'auto', mb: 2,
                                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <PhoneIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>טלפון</Typography>
                                <Typography variant="h6" color="primary" fontWeight={700} dir="ltr">
                                    054-2663030
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card elevation={0} sx={cardStyle}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Box sx={{
                                    width: 50, height: 50, borderRadius: '50%', mx: 'auto', mb: 2,
                                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <EmailIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>דוא"ל</Typography>
                                <Typography variant="body1" color="primary" fontWeight={600}>
                                    boriaa85@gmail.com
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card elevation={0} sx={cardStyle}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Box sx={{
                                    width: 50, height: 50, borderRadius: '50%', mx: 'auto', mb: 2,
                                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <TimeIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>שעות פעילות</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ימים א׳–ה׳: 08:00–18:00
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    יום ו׳: 08:00–13:00
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Support Categories */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>נושאי תמיכה</Typography>
                <Grid container spacing={2} sx={{ mb: 5 }}>
                    {supportCategories.map((cat, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card elevation={0} sx={{
                                ...cardStyle,
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, width: '100%' }}>
                                    <Box sx={{
                                        width: 56, height: 56, borderRadius: 2, flexShrink: 0,
                                        bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'primary.main',
                                    }}>
                                        {cat.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700}>{cat.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{cat.description}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Contact Form */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>פנייה לתמיכה</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    מלא את הטופס ונחזור אליך בהקדם האפשרי
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="שם מלא"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label='דוא"ל'
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="נושא הפנייה"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="תוכן ההודעה"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                multiline
                                rows={5}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SendIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 5,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                    boxShadow: '0 4px 16px rgba(74, 222, 128, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                        boxShadow: '0 6px 20px rgba(74, 222, 128, 0.4)',
                                    },
                                }}
                            >
                                שלח פנייה
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* FAQ Section */}
            <Paper
                elevation={mode === 'dark' ? 4 : 2}
                sx={{
                    p: { xs: 3, sm: 5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>שאלות נפוצות</Typography>

                {[
                    {
                        q: 'כיצד ניתן לאפס סיסמה?',
                        a: 'ניתן לפנות למנהל המערכת או ליצור קשר עם צוות התמיכה בטלפון 054-2663030 לצורך איפוס סיסמה.'
                    },
                    {
                        q: 'כיצד ניתן להוסיף ציוד חדש למערכת?',
                        a: 'ניתן להוסיף ציוד חדש באמצעות לחיצה על "הוסף ציוד" בדף הציוד, או לייבא רשימת ציוד מקובץ CSV דרך תפריט הייבוא.'
                    },
                    {
                        q: 'האם ניתן לייצא דוחות בדיקה?',
                        a: 'כן, המערכת תומכת בייצוא דוחות בדיקה לפורמט PDF ו-Excel. ניתן לייצא דוחות בודדים או דוחות מרוכזים.'
                    },
                    {
                        q: 'מהן שעות פעילות התמיכה?',
                        a: 'צוות התמיכה זמין בימים א׳–ה׳ בשעות 08:00–18:00, וביום ו׳ בשעות 08:00–13:00. ניתן להשאיר הודעה מחוץ לשעות הפעילות ונחזור אליך בהקדם.'
                    },
                ].map((faq, index) => (
                    <Box key={index} sx={{
                        mb: 3,
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.04)' : 'rgba(34,197,94,0.04)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="שאלה" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                            {faq.q}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, pr: 1 }}>
                            {faq.a}
                        </Typography>
                    </Box>
                ))}
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Support;
