import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Instagram as InstagramIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                py: 6,
                mt: 'auto',
               
                width: '100%',
            }}
        >
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1536px', margin: '0 auto' }}>
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
                            Hoist & Crane
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            מערכת מקצועית לניהול ציוד הרמה, בדיקות ותחזוקה עם טכנולוגיות מתקדמות.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <IconButton size="small" color="primary" aria-label="Facebook">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton size="small" color="primary" aria-label="Twitter">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton size="small" color="primary" aria-label="LinkedIn">
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton size="small" color="primary" aria-label="Instagram">
                                <InstagramIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            קישורים מהירים
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                דף הבית
                            </Link>
                            <Link href="/equipment" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                ציוד
                            </Link>
                            <Link href="/inspections" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                בדיקות
                            </Link>
                            <Link href="/documents" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                מסמכים
                            </Link>
                            <Link href="/issues" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                תקלות
                            </Link>
                        </Box>
                    </Grid>

                    {/* Resources */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            משאבים
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="#" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                מדריך משתמש
                            </Link>
                            <Link href="#" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                שאלות נפוצות
                            </Link>
                            <Link href="#" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                תמיכה טכנית
                            </Link>
                            <Link href="#" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                תנאי שימוש
                            </Link>
                            <Link href="#" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                                מדיניות פרטיות
                            </Link>
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            צור קשר
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    info@hoistcrane.com
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    03-1234567
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="text.secondary">
                                    תל אביב, ישראל
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        © {currentYear} Hoist & Crane. כל הזכויות שמורות.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link href="#" color="text.secondary" underline="hover" variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>
                            תנאי שימוש
                        </Link>
                        <Link href="#" color="text.secondary" underline="hover" variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>
                            מדיניות פרטיות
                        </Link>
                        <Link href="#" color="text.secondary" underline="hover" variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>
                            הצהרת נגישות
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
