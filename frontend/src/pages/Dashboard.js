import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { Build as BuildIcon, Assignment as InspectionIcon, Report as ReportIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import { equipmentAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

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

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    const statCards = [
        {
            title: 'סה"כ ציוד',
            value: stats?.total || 0,
            icon: <BuildIcon fontSize="large" />,
            color: '#1976d2'
        },
        {
            title: 'בדיקות השבוע',
            value: 0,
            icon: <InspectionIcon fontSize="large" />,
            color: '#2e7d32'
        },
        {
            title: 'תקלות פתוחות',
            value: 0,
            icon: <ReportIcon fontSize="large" />,
            color: '#d32f2f'
        },
        {
            title: 'ציוד פעיל',
            value: stats?.by_status?.active || 0,
            icon: <TrendingIcon fontSize="large" />,
            color: '#ed6c02'
        },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ height: '100%', bgcolor: card.color, color: 'white' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="h3" component="div">
                                            {card.value}
                                        </Typography>
                                        <Typography variant="h6">
                                            {card.title}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ opacity: 0.7 }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            סטטוס ציוד
                        </Typography>
                        {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
                            <Box key={status} display="flex" justifyContent="space-between" py={1}>
                                <Typography>{status}</Typography>
                                <Typography fontWeight="bold">{count}</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            סוגי ציוד
                        </Typography>
                        {stats?.by_type && Object.entries(stats.by_type).map(([type, count]) => (
                            <Box key={type} display="flex" justifyContent="space-between" py={1}>
                                <Typography>{type}</Typography>
                                <Typography fontWeight="bold">{count}</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
