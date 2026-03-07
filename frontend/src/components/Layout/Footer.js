import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                borderTop: 1,
                borderColor: 'divider',
                py: 2.5,
                px: { xs: 2, sm: 3, md: 4 },
                mt: 'auto',
                width: '100%',
            }}
        >
            <Box sx={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Hoist & Crane
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        © {currentYear} כל הזכויות שמורות
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2.5 }}>
                    <Link href="#" color="text.secondary" underline="hover" variant="caption"
                        sx={{ '&:hover': { color: 'primary.main' } }}>
                        תנאי שימוש
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" variant="caption"
                        sx={{ '&:hover': { color: 'primary.main' } }}>
                        מדיניות פרטיות
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" variant="caption"
                        sx={{ '&:hover': { color: 'primary.main' } }}>
                        תמיכה
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
