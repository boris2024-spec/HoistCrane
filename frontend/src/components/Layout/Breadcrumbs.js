import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { Home as HomeIcon, NavigateBefore as SeparatorIcon } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const routeLabels = {
    '': 'לוח בקרה',
    'equipment': 'ציוד',
    'new': 'חדש',
    'edit': 'עריכה',
    'import': 'ייבוא',
    'inspections': 'בדיקות',
    'report': 'דוח',
    'documents': 'מסמכים',
    'issues': 'תקלות',
    'maintenance': 'תחזוקה',
    'terms': 'תנאי שימוש',
    'privacy': 'מדיניות פרטיות',
    'support': 'תמיכה',
};

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const Breadcrumbs = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Don't show breadcrumbs on the root dashboard
    if (pathSegments.length === 0) return null;

    const crumbs = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        let label = routeLabels[segment] || (isUUID(segment) ? 'פרטים' : segment);

        return { label, path, isLast };
    });

    return (
        <Box sx={{ mb: 2 }}>
            <MuiBreadcrumbs
                separator={<SeparatorIcon fontSize="small" />}
                sx={{ '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
            >
                <Link
                    component={RouterLink}
                    to="/"
                    color="inherit"
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
                        fontSize: '0.85rem',
                    }}
                >
                    <HomeIcon sx={{ fontSize: 16 }} />
                    ראשי
                </Link>
                {crumbs.map((crumb) =>
                    crumb.isLast ? (
                        <Typography key={crumb.path} variant="body2" color="text.primary" fontWeight={600}
                            sx={{ fontSize: '0.85rem' }}>
                            {crumb.label}
                        </Typography>
                    ) : (
                        <Link
                            key={crumb.path}
                            component={RouterLink}
                            to={crumb.path}
                            color="inherit"
                            sx={{
                                textDecoration: 'none', '&:hover': { textDecoration: 'underline' },
                                fontSize: '0.85rem',
                            }}
                        >
                            {crumb.label}
                        </Link>
                    )
                )}
            </MuiBreadcrumbs>
        </Box>
    );
};

export default Breadcrumbs;
