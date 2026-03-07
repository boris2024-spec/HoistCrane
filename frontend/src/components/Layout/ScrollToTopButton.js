import React, { useState, useEffect } from 'react';
import { Fab, Zoom, Tooltip } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 250);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Zoom in={visible} unmountOnExit>
            <Tooltip title="גלול למעלה" arrow placement="right">
                <Fab
                    onClick={scrollToTop}
                    size="medium"
                    aria-label="scroll to top"
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        left: 32,
                        bgcolor: 'primary.main',
                        color: 'background.paper',
                        boxShadow: 4,
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'translateY(-3px)',
                            boxShadow: 6,
                        },
                        transition: 'all 0.25s ease-in-out',
                        zIndex: 1200,
                    }}
                >
                    <KeyboardArrowUpIcon />
                </Fab>
            </Tooltip>
        </Zoom>
    );
};

export default ScrollToTopButton;
