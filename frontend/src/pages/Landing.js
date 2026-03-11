import React from 'react';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent,
    AppBar, Toolbar, Divider,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Engineering as EngineeringIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    QrCode as QrIcon,
    Assessment as ReportIcon,
    Notifications as AlertIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FEATURES = [
    {
        icon: <EngineeringIcon sx={{ fontSize: 40 }} />,
        title: 'ניהול ציוד הרמה',
        description: 'ניהול מלא של כל ציוד ההרמה שלך — מנופים, עגורנים, מלגזות ועוד.',
    },
    {
        icon: <QrIcon sx={{ fontSize: 40 }} />,
        title: 'קודי QR',
        description: 'סריקת QR לגישה מהירה לכרטיסיית ציוד, היסטוריית טיפולים ותעודות.',
    },
    {
        icon: <ReportIcon sx={{ fontSize: 40 }} />,
        title: 'דוחות ובדיקות',
        description: 'הפקת דוחות בדיקה תקופתית, מעקב אחר ליקויים ותיקונים.',
    },
    {
        icon: <AlertIcon sx={{ fontSize: 40 }} />,
        title: 'התראות חכמות',
        description: 'קבלת התראות לפני תפוגת תעודות, בדיקות קרובות ותחזוקות.',
    },
    {
        icon: <SecurityIcon sx={{ fontSize: 40 }} />,
        title: 'אבטחה ותאימות',
        description: 'עמידה בתקנות בטיחות, תיעוד מלא ומאובטח של כל הפעולות.',
    },
    {
        icon: <SpeedIcon sx={{ fontSize: 40 }} />,
        title: 'ביצועים ויעילות',
        description: 'דשבורד בזמן אמת, ניתוח נתונים וזיהוי בעיות לפני שקורות.',
    },
];

const PLANS = [
    {
        name: 'Free',
        price: '0',
        features: ['עד 50 ציודים', '3 משתמשים', 'אתר אחד', 'תמיכה באימייל'],
        color: '#9e9e9e',
    },
    {
        name: 'Starter',
        price: '99',
        features: ['עד 200 ציודים', '10 משתמשים', '5 אתרים', 'ייצוא Excel', 'קודי QR', 'תמיכה מועדפת'],
        color: '#4ade80',
        popular: true,
    },
    {
        name: 'Professional',
        price: '299',
        features: ['עד 1,000 ציודים', '50 משתמשים', '20 אתרים', 'ייצוא PDF + Excel', 'API גישה', 'תמיכה בעדיפות'],
        color: '#3b82f6',
    },
];

export default function Landing() {
    return (
        <Box sx={{ direction: 'rtl' }}>
            {/* Navigation */}
            <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#4ade80' }}>
                        🏗️ HoistCrane
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button component={Link} to="/login" variant="text">
                            התחברות
                        </Button>
                        <Button
                            component={Link}
                            to="/signup"
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                },
                            }}
                        >
                            התחל בחינם
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box
                sx={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(74,222,128,0.08) 0%, transparent 60%)',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography variant="h2" fontWeight={800} gutterBottom>
                                ניהול ציוד הרמה
                                <br />
                                <Box component="span" sx={{ color: '#4ade80' }}>חכם ובטוח</Box>
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                                פלטפורמה מקיפה לניהול, מעקב ותיעוד ציוד הרמה.
                                עמידה בתקנות בטיחות, דוחות אוטומטיים, והתראות חכמות.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    component={Link}
                                    to="/signup"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            boxShadow: '0 8px 24px rgba(74, 222, 128, 0.4)',
                                        },
                                    }}
                                >
                                    התחל 14 ימי ניסיון חינם
                                </Button>
                                <Button
                                    component={Link}
                                    to="/login"
                                    variant="outlined"
                                    size="large"
                                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                                >
                                    התחברות
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(59,130,246,0.1))',
                                    border: '1px solid rgba(74,222,128,0.2)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h1" sx={{ fontSize: '6rem' }}>🏗️</Typography>
                                <Typography variant="h5" fontWeight={600} sx={{ mt: 2, color: '#4ade80' }}>
                                    HoistCrane Platform
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    ניהול ציוד הרמה בענן
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight={700} align="center" gutterBottom>
                        כל מה שצריך לניהול ציוד הרמה
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                        פלטפורמה אחת שמחליפה גיליונות Excel, תיקיות נייר ומערכות מיושנות
                    </Typography>

                    <Grid container spacing={4}>
                        {FEATURES.map((feature, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ height: '100%', textAlign: 'center', p: 2, '&:hover': { boxShadow: 6 } }}>
                                    <CardContent>
                                        <Box sx={{ color: '#4ade80', mb: 2 }}>
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Pricing Section */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight={700} align="center" gutterBottom>
                        תוכניות ומחירים
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
                        התחל בחינם, שדרג כשצריך
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        {PLANS.map((plan, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        textAlign: 'center',
                                        position: 'relative',
                                        border: plan.popular ? `2px solid ${plan.color}` : undefined,
                                        '&:hover': { boxShadow: 8 },
                                    }}
                                >
                                    {plan.popular && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -12,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                bgcolor: plan.color,
                                                color: '#fff',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            הכי פופולרי
                                        </Box>
                                    )}
                                    <CardContent sx={{ py: 4 }}>
                                        <Typography variant="h5" fontWeight={600}>
                                            {plan.name}
                                        </Typography>
                                        <Typography variant="h3" fontWeight={800} sx={{ my: 2 }}>
                                            ₪{plan.price}
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                /חודש
                                            </Typography>
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        {plan.features.map((f, j) => (
                                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                                <CheckIcon sx={{ fontSize: 18, color: plan.color, mr: 1 }} />
                                                <Typography variant="body2">{f}</Typography>
                                            </Box>
                                        ))}

                                        <Button
                                            component={Link}
                                            to="/signup"
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                mt: 3,
                                                py: 1.5,
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}cc 100%)`,
                                            }}
                                        >
                                            {plan.price === '0' ? 'התחל בחינם' : 'התחל ניסיון חינם'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 4, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} HoistCrane. כל הזכויות שמורות.
                </Typography>
            </Box>
        </Box>
    );
}
