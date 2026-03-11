import React from 'react';
import {
    Container, Paper, Typography, Box, Divider, Grid, Card, CardContent,
    List, ListItem, ListItemIcon, ListItemText, Chip, Avatar
} from '@mui/material';
import {
    Info as InfoIcon,
    Engineering as EngineeringIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    QrCode as QrIcon,
    Assessment as ReportIcon,
    Notifications as AlertIcon,
    CheckCircle as CheckIcon,
    CalendarMonth as CalendarIcon,
    Build as BuildIcon,
    Description as DocumentIcon,
    BugReport as BugIcon,
    Cloud as CloudIcon,
    Devices as DevicesIcon,
    Language as LanguageIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const About = () => {
    const { mode } = useThemeMode();

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

    const features = [
        {
            icon: <EngineeringIcon sx={{ fontSize: 32 }} />,
            title: 'ניהול ציוד הרמה',
            description: 'ניהול מלא ומרכזי של כל ציוד ההרמה — מנופים, עגורנים, מלגזות, מתקני הרמה ועוד. מעקב אחר מצב הציוד, מיקום, בעלים ותוקף רישיונות.',
        },
        {
            icon: <QrIcon sx={{ fontSize: 32 }} />,
            title: 'קודי QR חכמים',
            description: 'יצירת קודי QR ייחודיים לכל פריט ציוד. סריקה מהירה בשטח לגישה מידית לכרטיסיית הציוד, היסטוריית טיפולים, תעודות בדיקה ומסמכים רלוונטיים.',
        },
        {
            icon: <ReportIcon sx={{ fontSize: 32 }} />,
            title: 'דוחות ובדיקות תקופתיות',
            description: 'הפקת דוחות בדיקה מקצועיים בהתאם לתקנות. מעקב אחר ליקויים, תיקונים ואישורים. ייצוא דוחות ל-PDF ו-Excel.',
        },
        {
            icon: <AlertIcon sx={{ fontSize: 32 }} />,
            title: 'התראות חכמות',
            description: 'מערכת התראות אוטומטית לפני תפוגת תעודות, בדיקות תקופתיות קרובות, תחזוקות מתוזמנות וליקויים פתוחים.',
        },
        {
            icon: <CalendarIcon sx={{ fontSize: 32 }} />,
            title: 'לוח תחזוקה',
            description: 'תכנון וניהול לוח תחזוקות שנתי. תזמון משימות תחזוקה, מעקב אחר ביצוע ותיעוד מלא של כל פעולות התחזוקה.',
        },
        {
            icon: <DocumentIcon sx={{ fontSize: 32 }} />,
            title: 'ניהול מסמכים',
            description: 'העלאה, ארגון ושמירה של מסמכים — תעודות בדיקה, רישיונות, אישורי בטיחות, חוזי שירות ועוד. חיפוש מהיר וגישה נוחה.',
        },
        {
            icon: <BugIcon sx={{ fontSize: 32 }} />,
            title: 'ניהול תקלות',
            description: 'דיווח ומעקב אחר תקלות וליקויים. קביעת עדיפויות, הקצאת אחראים, מעקב אחר תהליך התיקון ותיעוד הפתרון.',
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 32 }} />,
            title: 'אבטחה ותאימות',
            description: 'עמידה מלאה בתקנות הבטיחות הישראליות. ניהול הרשאות מבוסס תפקידים, תיעוד מאובטח וגיבוי נתונים.',
        },
    ];

    const highlights = [
        { icon: <CloudIcon />, text: 'מערכת ענן — גישה מכל מקום ובכל זמן' },
        { icon: <DevicesIcon />, text: 'ממשק רספונסיבי — מותאם לנייד, טאבלט ומחשב' },
        { icon: <LanguageIcon />, text: 'ממשק בעברית מלאה עם תמיכה RTL' },
        { icon: <SpeedIcon />, text: 'דשבורד בזמן אמת עם סטטיסטיקות ותובנות' },
        { icon: <StarIcon />, text: 'תוכניות מנוי גמישות — כולל תוכנית חינמית' },
        { icon: <SecurityIcon />, text: 'אבטחת מידע ברמה גבוהה והצפנת נתונים' },
    ];

    const stats = [
        { label: 'סוגי ציוד נתמכים', value: '20+' },
        { label: 'ייצוא דוחות', value: 'PDF & Excel' },
        { label: 'זמינות המערכת', value: '99.9%' },
        { label: 'תמיכה', value: '24/7' },
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={mode === 'dark' ? 4 : 2}
                sx={{
                    p: { xs: 3, sm: 5, md: 6 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
                        background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(74, 222, 128, 0.3)',
                    }}>
                        <InfoIcon sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h4" sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        אודות Hoist & Crane
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 600, mx: 'auto' }}>
                        מערכת ניהול ציוד הרמה מתקדמת המיועדת לחברות, קבלנים ובודקי ציוד הרמה מוסמכים בישראל.
                        המערכת מאפשרת ניהול מרכזי, חכם ויעיל של כל ציוד ההרמה בארגון.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* About Description */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        🏗️ מה זה Hoist & Crane?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                        Hoist & Crane היא פלטפורמת SaaS מבוססת ענן לניהול ציוד הרמה. המערכת פותחה במיוחד עבור
                        השוק הישראלי ועונה על הדרישות הרגולטוריות של תקנות הבטיחות בעבודה (ציוד הרמה).
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                        המערכת מאפשרת לחברות ניהול ציוד הרמה, חברות בנייה, קבלנים ובודקים מוסמכים לנהל את כל
                        תהליכי הבדיקה, התחזוקה והתיעוד במקום אחד — בצורה דיגיטלית, מסודרת ונגישה.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        במקום ניהול בטפסים ידניים, גיליונות אקסל ותיקיות פיזיות — Hoist & Crane מביאה את כל
                        המידע לענן, עם גישה מכל מקום, התראות אוטומטיות, הפקת דוחות מקצועיים ומעקב בזמן אמת.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 5 }}>
                    {stats.map((stat, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                            <Card elevation={0} sx={{
                                ...cardStyle,
                                textAlign: 'center',
                                bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.04)' : 'rgba(34,197,94,0.04)',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h5" fontWeight={800} color="primary">{stat.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Features */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    ✨ יכולות ותכונות עיקריות
                </Typography>
                <Grid container spacing={2.5} sx={{ mb: 5 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card elevation={0} sx={cardStyle}>
                                <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2.5 }}>
                                    <Box sx={{
                                        width: 52, height: 52, borderRadius: 2, flexShrink: 0,
                                        bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.08)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'primary.main',
                                    }}>
                                        {feature.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                                            {feature.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {feature.description}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Highlights */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    🚀 למה Hoist & Crane?
                </Typography>
                <Grid container spacing={2} sx={{ mb: 5 }}>
                    {highlights.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                                borderRadius: 2,
                                bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.04)' : 'rgba(34,197,94,0.04)',
                                border: '1px solid',
                                borderColor: mode === 'dark' ? 'rgba(74,222,128,0.1)' : 'rgba(34,197,94,0.1)',
                            }}>
                                <Avatar sx={{
                                    width: 36, height: 36,
                                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.15)' : 'rgba(34,197,94,0.12)',
                                    color: 'primary.main',
                                }}>
                                    {item.icon}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>{item.text}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 4 }} />

                {/* Target Audience */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    👥 למי המערכת מיועדת?
                </Typography>
                <List sx={{ mb: 4  }}> 
                    {[
                        'חברות ציוד הרמה וניהול מנופים',
                        'חברות בנייה ותשתיות',
                        'קבלני הרמה וציוד כבד',
                        'בודקי ציוד הרמה מוסמכים',
                        'מנהלי בטיחות בארגונים',
                        'חברות תחזוקה ושירות לציוד הרמה',
                    ].map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5, px: 0 , direction: 'rtl', textAlign: 'right' }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            />
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ mb: 4 }} />

                {/* Tech Stack */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    🛠️ טכנולוגיות
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                    {[
                        'React', 'Material UI', 'Django', 'Django REST Framework',
                        'PostgreSQL', 'Docker', 'Nginx', 'QR Code', 'PDF Generation',
                        'Excel Export', 'REST API'
                    ].map((tech, index) => (
                        <Chip
                            key={index}
                            label={tech}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderColor: mode === 'dark' ? 'rgba(74,222,128,0.3)' : 'rgba(34,197,94,0.3)',
                                color: 'text.primary',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.08)',
                                    borderColor: 'primary.main',
                                },
                            }}
                        />
                    ))}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Version Info */}
                <Box sx={{
                    p: 3, borderRadius: 3,
                    bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.04)' : 'rgba(34,197,94,0.04)',
                    border: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(74,222,128,0.1)' : 'rgba(34,197,94,0.1)',
                    textAlign: 'center',
                }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        גרסה נוכחית
                    </Typography>
                    <Chip
                        label="v2.0.0 — SaaS Edition"
                        color="primary"
                        sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1.5 }}>
                        © {new Date().getFullYear()} Hoist & Crane — כל הזכויות שמורות
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default About;
