import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon,
    ListItemText, IconButton, Menu, MenuItem, Divider, useMediaQuery, useTheme,
    Badge, Tooltip, InputBase, Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon, Build as BuildIcon, Description as DocumentIcon,
    Assignment as InspectionIcon, Report as ReportIcon, Menu as MenuIcon,
    Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon,
    Notifications as NotificationsIcon, Close as CloseIcon, Search as SearchIcon,
    Logout as LogoutIcon, Settings as SettingsIcon, Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import Footer from './Footer';
import HoistCraneLogo from '../Logo/HoistCraneLogo';

const drawerWidth = 260;

const menuItems = [
    { text: 'לוח בקרה', icon: <DashboardIcon />, path: '/' },
    { text: 'ציוד', icon: <BuildIcon />, path: '/equipment' },
    { text: 'בדיקות', icon: <InspectionIcon />, path: '/inspections' },
    { text: 'מסמכים', icon: <DocumentIcon />, path: '/documents' },
    { text: 'תקלות', icon: <ReportIcon />, path: '/issues' },
];

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { user, logout, loading } = useAuth();
    const { mode, toggleTheme } = useThemeMode();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: '50%', border: '3px solid',
                        borderColor: 'primary.main', borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite', mx: 'auto', mb: 2,
                        '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                    }} />
                    <Typography variant="h6" color="primary" fontWeight={600}>טוען...</Typography>
                </Box>
            </Box>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleMenu = (event) => { setAnchorEl(event.currentTarget); };
    const handleClose = () => { setAnchorEl(null); };
    const handleLogout = () => { logout(); handleClose(); navigate('/login'); };
    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen); };
    const handleOpenSearch = (event) => { setSearchAnchorEl(event.currentTarget); };
    const handleCloseSearch = () => { setSearchAnchorEl(null); };
    const handleNavigate = (path) => { navigate(path); if (isMobile) setMobileOpen(false); };

    const handleSearchSubmit = () => {
        const query = searchQuery.trim();
        if (!query) { navigate('/equipment'); return; }
        navigate(`/equipment?search=${encodeURIComponent(query)}`);
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => handleNavigate('/')}>
                    <HoistCraneLogo size={42} />
                    <Box>
                        <Typography variant="h6" component="div" sx={{
                            fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2,
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Hoist & Crane
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            ניהול ציוד הרמה
                        </Typography>
                    </Box>
                </Box>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} edge="end" size="small"><CloseIcon /></IconButton>
                )}
            </Box>

            <Divider />

            <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <ListItem button key={item.text} onClick={() => handleNavigate(item.path)}
                            sx={{
                                borderRadius: 2, mb: 0.5, py: 1.2,
                                bgcolor: active ? (mode === 'dark' ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.1)') : 'transparent',
                                borderRight: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                                '&:hover': {
                                    bgcolor: active
                                        ? (mode === 'dark' ? 'rgba(74,222,128,0.18)' : 'rgba(34,197,94,0.15)')
                                        : (mode === 'dark' ? 'rgba(74,222,128,0.06)' : 'rgba(34,197,94,0.06)'),
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'primary.main' : 'text.primary',
                                    fontSize: '0.9rem',
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            <Box sx={{ p: 2, bgcolor: mode === 'dark' ? 'rgba(74, 222, 128, 0.03)' : 'rgba(34, 197, 94, 0.03)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{
                        width: 36, height: 36, bgcolor: 'primary.main',
                        color: mode === 'dark' ? '#000' : '#fff', fontSize: '0.9rem', fontWeight: 700,
                    }}>
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{user.username}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {user.email || 'משתמש'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Permanent drawer — desktop (right side) */}
            <Drawer variant="permanent" anchor="right" sx={{
                display: { xs: 'none', md: 'block' }, width: drawerWidth, flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'background.paper', borderLeft: 1, borderRight: 0, borderColor: 'divider' },
            }}>
                {drawer}
            </Drawer>

            {/* Temporary drawer — mobile (right side) */}
            <Drawer variant="temporary" anchor="right" open={mobileOpen} onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' },
                }}
            >
                {drawer}
            </Drawer>

            {/* Main area */}
            <Box sx={{
                flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
                marginRight: { xs: 0, md: `${drawerWidth}px` },
                width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            }}>
                <AppBar position="sticky" elevation={0} sx={{
                    bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: mode === 'dark' ? 'rgba(26, 31, 46, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                }}>
                    <Toolbar sx={{ gap: 1 }}>
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, display: { md: 'none' } }}>
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1rem', display: { xs: 'none', sm: 'block' } }}>
                            {menuItems.find(item => isActive(item.path))?.text || 'ניהול ציוד הרמה'}
                        </Typography>

                        {/* Search — desktop */}
                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}
                            sx={{
                                display: { xs: 'none', md: 'flex' }, alignItems: 'center', width: { md: 240, lg: 300 },
                                px: 1.5, py: 0.4, borderRadius: 2, border: 1, borderColor: 'divider',
                                bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                '&:focus-within': { borderColor: 'primary.main' },
                                transition: 'all 0.2s',
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                            <InputBase value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="חיפוש ציוד..." inputProps={{ 'aria-label': 'search' }} sx={{ flex: 1, fontSize: 13 }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton color="inherit" onClick={handleOpenSearch} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
                                <SearchIcon />
                            </IconButton>

                            <Tooltip title={mode === 'dark' ? 'מצב בהיר' : 'מצב כהה'} arrow>
                                <IconButton color="inherit" onClick={toggleTheme} size="small">
                                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="התראות" arrow>
                                <IconButton color="inherit" size="small">
                                    <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <IconButton onClick={handleMenu} size="small" sx={{ ml: 0.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: mode === 'dark' ? '#000' : '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                            </IconButton>

                            {/* Mobile search menu */}
                            <Menu anchorEl={searchAnchorEl} open={Boolean(searchAnchorEl)} onClose={handleCloseSearch}
                                PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 280, borderRadius: 2, p: 1 } }}>
                                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); handleCloseSearch(); }}
                                    sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.75, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                    <InputBase autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="חיפוש..." inputProps={{ 'aria-label': 'search' }} sx={{ flex: 1, fontSize: 14 }} />
                                </Box>
                            </Menu>

                            {/* User menu */}
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
                                PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 220, borderRadius: 2 } }}>
                                <Box sx={{ px: 2, py: 1.5 }}>
                                    <Typography variant="body2" fontWeight={700}>{user.username}</Typography>
                                    <Typography variant="caption" color="text.secondary">{user.email || 'user@example.com'}</Typography>
                                </Box>
                                <Divider />
                                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }} sx={{ gap: 1.5, py: 1 }}>
                                    <PersonIcon fontSize="small" color="action" /> הפרופיל שלי
                                </MenuItem>
                                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }} sx={{ gap: 1.5, py: 1 }}>
                                    <SettingsIcon fontSize="small" color="action" /> הגדרות
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1.5, py: 1 }}>
                                    <LogoutIcon fontSize="small" /> התנתק
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, md: 4 }, py: 3, maxWidth: '1400px', width: '100%', mx: 'auto', overflow: 'hidden' }}>
                    <Outlet />
                </Box>

                <Footer />
            </Box>
        </Box>
    );
};

export default Layout;
