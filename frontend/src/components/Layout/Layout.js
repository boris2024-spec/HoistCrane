import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    useMediaQuery,
    useTheme,
    Container,
    Badge,
    Tooltip,
    InputBase
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Build as BuildIcon,
    Description as DocumentIcon,
    Assignment as InspectionIcon,
    Report as ReportIcon,
    Menu as MenuIcon,
    AccountCircle,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Notifications as NotificationsIcon,
    Close as CloseIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import Footer from './Footer';

const drawerWidth = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'ציוד', icon: <BuildIcon />, path: '/equipment' },
    { text: 'בדיקות', icon: <InspectionIcon />, path: '/inspections' },
    { text: 'מסמכים', icon: <DocumentIcon />, path: '/documents' },
    { text: 'תקלות', icon: <ReportIcon />, path: '/issues' },
];

const Layout = () => {
    const navigate = useNavigate();
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default'
                }}
            >
                <Typography variant="h6" color="primary">טוען...</Typography>
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleOpenSearch = (event) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleCloseSearch = () => {
        setSearchAnchorEl(null);
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleSearchSubmit = () => {
        const query = searchQuery.trim();
        if (!query) {
            navigate('/equipment');
            return;
        }
        navigate(`/equipment?search=${encodeURIComponent(query)}`);
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
            }}>
                <Box>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Hoist & Crane
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        מערכת ניהול ציוד הרמה
                    </Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} edge="end">
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>
            <Divider />
            <List sx={{ px: 2, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            '&:hover': {
                                bgcolor: 'primary.main',
                                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                    color: mode === 'dark' ? '#000' : '#fff',
                                },
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontWeight: 500,
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <Box sx={{ p: 2, bgcolor: mode === 'dark' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(34, 197, 94, 0.05)' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    משתמש מחובר
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                    {user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {user.email || 'user@example.com'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Main content area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                }}
            >
                {/* Header */}
                <AppBar

                    position="sticky"
                    elevation={5}
                    top={0}
                    width="100%"
                    sx={{
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderBottom: 1,
                        borderColor: 'divider',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: mode === 'dark'
                            ? 'rgba(26, 31, 46, 0.8)'
                            : 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            ניהול ציוד הרמה
                        </Typography>

                        {/* Search (desktop) */}
                        <Box
                            component="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearchSubmit();
                            }}
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                mr: 2,
                                width: { md: 260, lg: 320 },
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 999,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: mode === 'dark'
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.04)',
                                '&:focus-within': {
                                    borderColor: 'primary.main',
                                    boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}20`,
                                },
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                            <InputBase
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="חיפוש..."
                                inputProps={{ 'aria-label': 'search' }}
                                sx={{ flex: 1, fontSize: 14 }}
                            />
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
                            {menuItems.map((item) => (
                                <Tooltip key={item.text} title={item.text} arrow>
                                    <IconButton
                                        color="inherit"
                                        onClick={() => handleNavigate(item.path)}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'primary.main',
                                                color: mode === 'dark' ? '#000' : '#fff',
                                            },
                                        }}
                                    >
                                        {item.icon}
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Search (mobile) */}
                            <IconButton
                                color="inherit"
                                title="חיפוש"
                                onClick={handleOpenSearch}
                                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                            >
                                <SearchIcon />
                            </IconButton>

                            <IconButton color="inherit" onClick={toggleTheme} title={mode === 'dark' ? 'מצב בהיר' : 'מצב כהה'}>
                                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>

                            <IconButton color="inherit" title="התראות">
                                <Badge badgeContent={3} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>

                            <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                                <AccountCircle />
                            </IconButton>

                            <Menu
                                anchorEl={searchAnchorEl}
                                open={Boolean(searchAnchorEl)}
                                onClose={handleCloseSearch}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        mt: 1.5,
                                        minWidth: 280,
                                        borderRadius: 2,
                                        p: 1,
                                    },
                                }}
                            >
                                <Box
                                    component="form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSearchSubmit();
                                        handleCloseSearch();
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: 999,
                                        border: 1,
                                        borderColor: 'divider',
                                        bgcolor: mode === 'dark'
                                            ? 'rgba(255,255,255,0.06)'
                                            : 'rgba(0,0,0,0.04)',
                                    }}
                                >
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                    <InputBase
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="חיפוש..."
                                        inputProps={{ 'aria-label': 'search' }}
                                        sx={{ flex: 1, fontSize: 14 }}
                                    />
                                </Box>
                            </Menu>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        mt: 1.5,
                                        minWidth: 200,
                                        borderRadius: 2,
                                    }
                                }}
                            >
                                <MenuItem disabled>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {user.email || 'user@example.com'}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                                    הפרופיל שלי
                                </MenuItem>
                                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                                    הגדרות
                                </MenuItem>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    התנתק
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Main content */}
                <Container
                    maxWidth="xl"
                    sx={{
                        mt: 4,
                        mb: 4,
                        flexGrow: 1,
                        px: { xs: 2, sm: 3 }
                    }}
                >
                    <Outlet />
                </Container>

                {/* Footer */}
                <Footer />
            </Box>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Layout;
