import React, { useState, useEffect, useCallback } from 'react';
import {
    IconButton, Badge, Menu, Box, Typography, List, ListItem,
    ListItemText, ListItemIcon, Divider, Button, Chip, Tooltip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Assignment as AssignmentIcon,
    Build as BuildIcon,
    Info as InfoIcon,
    DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const typeConfig = {
    inspection_reminder: { icon: <AssignmentIcon fontSize="small" />, color: '#f59e0b' },
    certificate_expiry: { icon: <WarningIcon fontSize="small" />, color: '#ef4444' },
    issue_assigned: { icon: <BuildIcon fontSize="small" />, color: '#3b82f6' },
    issue_resolved: { icon: <CheckIcon fontSize="small" />, color: '#22c55e' },
    maintenance_due: { icon: <BuildIcon fontSize="small" />, color: '#a855f7' },
    system: { icon: <InfoIcon fontSize="small" />, color: '#64748b' },
};

const NotificationCenter = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationAPI.unreadCount();
            setUnreadCount(response.data.count || 0);
        } catch {
            // silently fail
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await notificationAPI.list({ page_size: 10 });
            setNotifications(response.data.results || response.data || []);
        } catch {
            // silently fail
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => setAnchorEl(null);

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch {
            // silently fail
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead([id]);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    };

    return (
        <>
            <Tooltip title="התראות" arrow>
                <IconButton color="inherit" size="small" onClick={handleOpen}>
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                    >
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        mt: 1.5, width: 380, maxHeight: 480, borderRadius: 2,
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    },
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight={700}>התראות</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead}>
                            סמן הכל כנקרא
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ overflow: 'auto', flex: 1, py: 0 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                אין התראות
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => {
                            const config = typeConfig[notification.type] || typeConfig.system;
                            return (
                                <ListItem
                                    key={notification.id}
                                    onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                                    sx={{
                                        cursor: notification.is_read ? 'default' : 'pointer',
                                        bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' },
                                        py: 1.5,
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: 1,
                                            bgcolor: config.color + '20', color: config.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {config.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2" fontWeight={notification.is_read ? 400 : 600} noWrap>
                                                    {notification.title}
                                                </Typography>
                                                {!notification.is_read && (
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                                    {notification.created_at && formatDistanceToNow(
                                                        new Date(notification.created_at),
                                                        { addSuffix: true, locale: he }
                                                    )}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            );
                        })
                    )}
                </List>
            </Menu>
        </>
    );
};

export default NotificationCenter;
