import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

const ThemeContext = createContext();

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                direction: 'rtl',
                palette: {
                    mode,
                    primary: {
                        main: mode === 'dark' ? '#4ade80' : '#22c55e',
                        light: '#86efac',
                        dark: '#16a34a',
                        contrastText: mode === 'dark' ? '#000000' : '#ffffff',
                    },
                    secondary: {
                        main: mode === 'dark' ? '#a3e635' : '#84cc16',
                        light: '#bef264',
                        dark: '#65a30d',
                    },
                    background: {
                        default: mode === 'dark' ? '#0a0f1a' : '#f8fafc',
                        paper: mode === 'dark' ? '#1a1f2e' : '#ffffff',
                    },
                    text: {
                        primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
                        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
                    },
                    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(30, 41, 59, 0.12)',
                    success: {
                        main: '#22c55e',
                    },
                    error: {
                        main: '#ef4444',
                    },
                    warning: {
                        main: '#f59e0b',
                    },
                    info: {
                        main: '#3b82f6',
                    },
                },
                typography: {
                    fontFamily: [
                        '-apple-system',
                        'BlinkMacSystemFont',
                        '"Segoe UI"',
                        'Roboto',
                        '"Helvetica Neue"',
                        'Arial',
                        'sans-serif',
                    ].join(','),
                    h1: {
                        fontWeight: 700,
                    },
                    h2: {
                        fontWeight: 700,
                    },
                    h3: {
                        fontWeight: 600,
                    },
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                    button: {
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                padding: '10px 24px',
                            },
                            contained: {
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 4px 12px 0 rgba(74, 222, 128, 0.4)',
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                                borderRight: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(30, 41, 59, 0.12)',
                            },
                        },
                    },
                },
            }, heIL),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
