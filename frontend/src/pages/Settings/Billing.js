import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, Grid, Alert, Chip,
    Card, CardContent, CardActions, LinearProgress, Divider,
    CircularProgress,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Star as StarIcon,
    Rocket as RocketIcon,
} from '@mui/icons-material';
import { tenantAPI } from '../../services/api';

const PLAN_FEATURES = {
    free: {
        icon: <CheckIcon sx={{ fontSize: 40 }} />,
        color: '#9e9e9e',
        features: ['עד 50 ציודים', 'עד 3 משתמשים', 'אתר אחד', 'תמיכה באימייל'],
    },
    starter: {
        icon: <StarIcon sx={{ fontSize: 40 }} />,
        color: '#4ade80',
        features: ['עד 200 ציודים', 'עד 10 משתמשים', 'עד 5 אתרים', 'תמיכה מועדפת', 'ייצוא Excel', 'קודי QR'],
    },
    professional: {
        icon: <RocketIcon sx={{ fontSize: 40 }} />,
        color: '#3b82f6',
        features: ['עד 1,000 ציודים', 'עד 50 משתמשים', 'עד 20 אתרים', 'תמיכה בעדיפות', 'ייצוא Excel + PDF', 'קודי QR', 'API גישה'],
    },
    enterprise: {
        icon: <RocketIcon sx={{ fontSize: 40 }} />,
        color: '#a855f7',
        features: ['ציוד בלתי מוגבל', 'משתמשים בלתי מוגל', 'אתרים בלתי מוגבל', 'תמיכה 24/7', 'כל התכונות', 'SLA מותאם'],
    },
};

export default function Billing() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [usage, setUsage] = useState(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [configRes, usageRes] = await Promise.all([
                tenantAPI.billingConfig(),
                tenantAPI.getUsage(),
            ]);
            setConfig(configRes.data);
            setUsage(usageRes.data);
        } catch (err) {
            setError('Failed to load billing information');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpgrade = async (plan) => {
        try {
            setProcessing(plan);
            setError('');
            const res = await tenantAPI.createCheckout({
                plan,
                success_url: window.location.origin + '/settings?billing=success',
                cancel_url: window.location.origin + '/settings?billing=cancelled',
            });
            // Redirect to Stripe Checkout
            window.location.href = res.data.checkout_url;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create checkout session');
            setProcessing('');
        }
    };

    const handleManageBilling = async () => {
        try {
            setProcessing('portal');
            setError('');
            const res = await tenantAPI.createPortal({
                return_url: window.location.origin + '/settings',
            });
            window.location.href = res.data.portal_url;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to open billing portal');
            setProcessing('');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the billing period.')) {
            return;
        }
        try {
            setProcessing('cancel');
            setError('');
            await tenantAPI.cancelSubscription();
            await loadData();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to cancel subscription');
        } finally {
            setProcessing('');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const currentPlan = config?.current_plan || 'free';
    const plans = config?.plans || {};

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
                חיוב ומנויים
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                ניהול התוכנית והחיוב שלך
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Current Plan Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6">
                            התוכנית הנוכחית:{' '}
                            <Chip
                                label={currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                                color={currentPlan === 'free' ? 'default' : 'primary'}
                                sx={{ ml: 1 }}
                            />
                        </Typography>
                        {config?.subscription_status && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                סטטוס: {config.subscription_status}
                            </Typography>
                        )}
                    </Box>
                    {currentPlan !== 'free' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={handleManageBilling}
                                disabled={!!processing}
                            >
                                {processing === 'portal' ? <CircularProgress size={20} /> : 'ניהול חיוב'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancel}
                                disabled={!!processing}
                            >
                                {processing === 'cancel' ? <CircularProgress size={20} /> : 'ביטול מנוי'}
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Usage bars */}
                {usage && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {[
                            { label: 'ציוד', data: usage.equipment },
                            { label: 'משתמשים', data: usage.users },
                            { label: 'אתרים', data: usage.sites },
                        ].map(({ label, data }) => (
                            <Grid item xs={12} sm={4} key={label}>
                                <Typography variant="body2" gutterBottom>
                                    {label}: {data.current} / {data.limit}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((data.current / data.limit) * 100, 100)}
                                    color={data.current >= data.limit ? 'error' : 'primary'}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>

            <Divider sx={{ mb: 3 }} />

            {/* Plan Cards */}
            <Typography variant="h6" gutterBottom fontWeight={600}>
                תוכניות זמינות
            </Typography>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {Object.entries(plans).map(([planKey, plan]) => {
                    const features = PLAN_FEATURES[planKey] || PLAN_FEATURES.starter;
                    const isCurrent = planKey === currentPlan;
                    const isDowngrade = getPlanOrder(planKey) <= getPlanOrder(currentPlan);

                    return (
                        <Grid item xs={12} md={4} key={planKey}>
                            <Card
                                variant={isCurrent ? 'outlined' : 'elevation'}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: isCurrent ? `2px solid ${features.color}` : undefined,
                                    position: 'relative',
                                }}
                            >
                                {isCurrent && (
                                    <Chip
                                        label="תוכנית נוכחית"
                                        size="small"
                                        color="primary"
                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Box sx={{ color: features.color, mb: 1 }}>
                                            {features.icon}
                                        </Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {plan.name}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                            ₪{plan.price_monthly}
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                /חודש
                                            </Typography>
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    {features.features.map((feature, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CheckIcon sx={{ fontSize: 18, color: features.color, mr: 1 }} />
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant={isCurrent ? 'outlined' : 'contained'}
                                        disabled={isCurrent || isDowngrade || !!processing}
                                        onClick={() => handleUpgrade(planKey)}
                                        sx={{
                                            background: !isCurrent && !isDowngrade
                                                ? `linear-gradient(135deg, ${features.color} 0%, ${features.color}cc 100%)`
                                                : undefined,
                                        }}
                                    >
                                        {processing === planKey ? (
                                            <CircularProgress size={20} />
                                        ) : isCurrent ? (
                                            'נבחרה'
                                        ) : isDowngrade ? (
                                            'שנמוך יותר'
                                        ) : (
                                            'שדרג עכשיו'
                                        )}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}

function getPlanOrder(plan) {
    const order = { free: 0, starter: 1, professional: 2, enterprise: 3 };
    return order[plan] ?? 0;
}
