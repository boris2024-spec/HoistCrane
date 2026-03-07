import React, { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, Card, CardContent, LinearProgress,
    Chip, Skeleton, CardActionArea, Divider
} from '@mui/material';
import {
    Build as BuildIcon, Assignment as InspectionIcon, Report as ReportIcon,
    TrendingUp as TrendingIcon, Warning as WarningIcon, CheckCircle as CheckIcon,
    Schedule as ScheduleIcon, Engineering as EngineeringIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../services/api';
import { useThemeMode } from '../context/ThemeContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const response = await equipmentAPI.stats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'סה"כ ציוד',
            value: stats?.total || 0,
            icon: <BuildIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.4)',
            path: '/equipment',
        },
        {
            title: 'ציוד פעיל',
            value: stats?.active_valid ?? (stats?.by_status?.active || 0),
            icon: <CheckIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            shadowColor: 'rgba(74, 222, 128, 0.4)',
            path: '/equipment',
        },
        {
            title: 'בתחזוקה',
            value: stats?.by_status?.maintenance || 0,
            icon: <EngineeringIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            shadowColor: 'rgba(245, 158, 11, 0.4)',
            path: '/equipment',
        },
        {
            title: 'לא פעיל',
            value: stats?.not_active_total ?? ((stats?.by_status?.inactive || 0) + (stats?.by_status?.retired || 0)),
            icon: <ReportIcon sx={{ fontSize: 32 }} />,
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            shadowColor: 'rgba(239, 68, 68, 0.4)',
            path: '/equipment',
        },
    ];

    const StatCardSkeleton = () => (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="40%" height={48} />
                <Skeleton variant="text" width="60%" height={24} />
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    לוח בקרה
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    סקירה כללית של מצב הציוד והמערכת
                </Typography>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {loading ? (
                    [0, 1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <StatCardSkeleton />
                        </Grid>
                    ))
                ) : (
                    statCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: `0 12px 28px ${card.shadowColor}`,
                                    },
                                }}
                            >
                                <CardActionArea onClick={() => navigate(card.path)}>
                                    <Box sx={{
                                        background: card.gradient,
                                        p: 3,
                                        color: '#fff',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Background decoration */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -20, right: -20,
                                            width: 100, height: 100,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                        }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: -30, right: 20,
                                            width: 60, height: 60,
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(255,255,255,0.08)',
                                        }} />

                                        <Box sx={{
                                            width: 48, height: 48, borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            mb: 2,
                                        }}>
                                            {card.icon}
                                        </Box>

                                        <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1, mb: 0.5 }}>
                                            {card.value.toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                            {card.title}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Content Grid */}
            <Grid container spacing={3}>
                {/* Equipment Status Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3, borderRadius: 3, height: '100%',
                        border: 1, borderColor: 'divider',
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={600}>התפלגות סטטוס ציוד</Typography>
                            <Chip
                                label="צפה בהכל"
                                size="small"
                                color="primary"
                                variant="outlined"
                                onClick={() => navigate('/equipment')}
                                icon={<ArrowForwardIcon />}
                                sx={{ cursor: 'pointer' }}
                            />
                        </Box>
                        {loading ? (
                            [0, 1, 2, 3].map(i => (
                                <Box key={i} sx={{ mb: 2.5 }}>
                                    <Skeleton variant="text" width="50%" height={20} />
                                    <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mt: 0.5 }} />
                                </Box>
                            ))
                        ) : (
                            stats?.by_status && (() => {
                                const total = stats.total || 1;
                                const statusConfig = {
                                    active: { label: 'פעיל', color: '#22c55e' },
                                    maintenance: { label: 'בתחזוקה', color: '#f59e0b' },
                                    inactive: { label: 'לא פעיל', color: '#94a3b8' },
                                    retired: { label: 'הוצא משימוש', color: '#ef4444' },
                                };
                                return Object.entries(stats.by_status).map(([status, count]) => {
                                    const config = statusConfig[status] || { label: status, color: '#94a3b8' };
                                    const percentage = Math.round((count / total) * 100);
                                    return (
                                        <Box key={status} sx={{ mb: 2.5 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: config.color }} />
                                                    <Typography variant="body2" fontWeight={500}>{config.label}</Typography>
                                                </Box>
                                                <Typography variant="body2" fontWeight={700} color="text.secondary">
                                                    {count} ({percentage}%)
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={percentage}
                                                sx={{
                                                    height: 8, borderRadius: 4,
                                                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 4,
                                                        bgcolor: config.color,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    );
                                });
                            })()
                        )}
                    </Paper>
                </Grid>

                {/* Equipment Types */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3, borderRadius: 3, height: '100%',
                        border: 1, borderColor: 'divider',
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={600}>סוגי ציוד</Typography>
                        </Box>
                        {loading ? (
                            [0, 1, 2].map(i => (
                                <Box key={i} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Skeleton variant="text" width="40%" height={24} />
                                    <Skeleton variant="text" width="15%" height={24} />
                                </Box>
                            ))
                        ) : (
                            stats?.by_type && (() => {
                                const typeLabels = {
                                    lifting_accessories: 'אביזרי הרמה',
                                    no_inspection_required: 'לא חייב בבדיקה',
                                    forklifts: 'מלגזות',
                                    lifting_facilities: 'מתקני הרמה',
                                };
                                const typeColors = {
                                    lifting_accessories: '#667eea',
                                    no_inspection_required: '#f59e0b',
                                    forklifts: '#4ade80',
                                    lifting_facilities: '#3b82f6',
                                };
                                return (
                                    <Box>
                                        {Object.entries(stats.by_type).map(([type, count], index, arr) => (
                                            <React.Fragment key={type}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5}>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Box sx={{
                                                            width: 36, height: 36, borderRadius: 1.5,
                                                            bgcolor: (typeColors[type] || '#94a3b8') + '20',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <BuildIcon sx={{ fontSize: 18, color: typeColors[type] || '#94a3b8' }} />
                                                        </Box>
                                                        <Typography variant="body1" fontWeight={500}>
                                                            {typeLabels[type] || type}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={count}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700,
                                                            bgcolor: (typeColors[type] || '#94a3b8') + '20',
                                                            color: typeColors[type] || '#94a3b8',
                                                        }}
                                                    />
                                                </Box>
                                                {index < arr.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                );
                            })()
                        )}
                    </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>פעולות מהירות</Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: 'הוסף ציוד חדש', icon: <BuildIcon />, path: '/equipment/new', color: '#4ade80' },
                                { label: 'ייבוא קובץ', icon: <TrendingIcon />, path: '/equipment/import', color: '#3b82f6' },
                                { label: 'צפה בבדיקות', icon: <InspectionIcon />, path: '/inspections', color: '#f59e0b' },
                                { label: 'צפה בתקלות', icon: <WarningIcon />, path: '/issues', color: '#ef4444' },
                                { label: 'מסמכים', icon: <ScheduleIcon />, path: '/documents', color: '#a855f7' },
                            ].map((action) => (
                                <Grid item xs={6} sm={4} md={2.4} key={action.label}>
                                    <Card
                                        sx={{
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: 1,
                                            borderColor: 'divider',
                                            '&:hover': {
                                                borderColor: action.color,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 4px 12px ${action.color}30`,
                                            },
                                        }}
                                    >
                                        <CardActionArea onClick={() => navigate(action.path)} sx={{ p: 2, textAlign: 'center' }}>
                                            <Box sx={{
                                                width: 44, height: 44, borderRadius: 2, mx: 'auto', mb: 1,
                                                bgcolor: action.color + '15',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: action.color,
                                            }}>
                                                {action.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                {action.label}
                                            </Typography>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
