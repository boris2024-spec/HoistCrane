import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, Alert, LinearProgress,
    List, ListItem, ListItemIcon, ListItemText, Chip, Divider
} from '@mui/material';
import {
    CloudUpload as UploadIcon, CheckCircle as CheckIcon,
    Error as ErrorIcon, Description as FileIcon,
    ArrowBack as BackIcon, Info as InfoIcon
} from '@mui/icons-material';
import { uploadEquipmentFile } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const EquipmentImport = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        const filename = selectedFile.name.toLowerCase();
        if (!filename.endsWith('.csv') && !filename.endsWith('.xlsx')) {
            setError('אנא בחר קובץ CSV או Excel (.xlsx)');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const handleFileChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleUpload = async () => {
        if (!file) { setError('אנא בחר קובץ'); return; }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await uploadEquipmentFile(file);
            setResult(response.data);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'שגיאה בהעלאת הקובץ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button startIcon={<BackIcon />} onClick={() => navigate('/equipment')} variant="text">
                    חזרה לרשימת ציוד
                </Button>
            </Box>

            <Typography variant="h4" fontWeight={700} gutterBottom>
                ייבוא ציוד
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                העלה קובץ CSV או Excel (.xlsx) לייבוא נתוני ציוד למערכת
            </Typography>

            <Paper sx={{ p: 4, borderRadius: 3, border: 1, borderColor: 'divider', mb: 3 }}>
                {/* Drag & Drop Zone */}
                <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    sx={{
                        border: 2,
                        borderStyle: 'dashed',
                        borderColor: dragOver ? 'primary.main' : 'divider',
                        borderRadius: 3,
                        p: 5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: dragOver
                            ? (mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.05)')
                            : 'transparent',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.04)' : 'rgba(34,197,94,0.02)',
                        },
                    }}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={loading}
                    />

                    <UploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.8 }} />

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        גרור קובץ לכאן או לחץ לבחירת קובץ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        תומך בפורמטים: CSV, Excel (.xlsx)
                    </Typography>
                </Box>

                {/* Selected File */}
                {file && (
                    <Box sx={{
                        mt: 3, p: 2, borderRadius: 2,
                        bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <FileIcon color="primary" />
                            <Box>
                                <Typography variant="body2" fontWeight={600}>{file.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                            </Box>
                        </Box>
                        <Chip label="מוכן להעלאה" color="success" size="small" variant="outlined" />
                    </Box>
                )}

                {/* Upload Button */}
                <Box sx={{ mt: 3 }}>
                    {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<UploadIcon />}
                        onClick={handleUpload}
                        disabled={!file || loading}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                    >
                        {loading ? 'מעלה...' : 'העלה קובץ'}
                    </Button>
                </Box>
            </Paper>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<ErrorIcon />}>
                    {error}
                </Alert>
            )}

            {/* Success Result */}
            {result && (
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'success.main', mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <CheckIcon color="success" />
                        <Typography variant="h6" fontWeight={600} color="success.main">
                            הייבוא הושלם בהצלחה
                        </Typography>
                    </Box>

                    <Box display="flex" gap={3} mb={2}>
                        <Box sx={{
                            flex: 1, p: 2, borderRadius: 2, textAlign: 'center',
                            bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.08)',
                        }}>
                            <Typography variant="h3" fontWeight={800} color="success.main">
                                {result.imported}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">יובאו בהצלחה</Typography>
                        </Box>
                        {result.skipped_existing > 0 && (
                            <Box sx={{
                                flex: 1, p: 2, borderRadius: 2, textAlign: 'center',
                                bgcolor: mode === 'dark' ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.08)',
                            }}>
                                <Typography variant="h3" fontWeight={800} color="warning.main">
                                    {result.skipped_existing}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">דולגו (כבר קיימים)</Typography>
                            </Box>
                        )}
                        {result.errors > 0 && (
                            <Box sx={{
                                flex: 1, p: 2, borderRadius: 2, textAlign: 'center',
                                bgcolor: mode === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                            }}>
                                <Typography variant="h3" fontWeight={800} color="error.main">
                                    {result.errors}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">שגיאות</Typography>
                            </Box>
                        )}
                    </Box>

                    {result.error_details && result.error_details.length > 0 && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>פרטי שגיאות:</Typography>
                            {result.error_details.map((err, idx) => (
                                <Typography key={idx} variant="body2">• {err}</Typography>
                            ))}
                        </Alert>
                    )}

                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/equipment')}
                    >
                        צפה בציוד שיובא
                    </Button>
                </Paper>
            )}

            {/* Instructions */}
            <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <InfoIcon color="info" />
                    <Typography variant="h6" fontWeight={600}>הנחיות לייבוא</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                    {[
                        'ניתן להעלות קובץ CSV (UTF-8) או Excel (.xlsx)',
                        'השורה הראשונה חייבת להכיל כותרות עמודות',
                        'מספרי ציוד כפולים יידולגו אוטומטית',
                        'פורמטי תאריך נתמכים: DD/MM/YYYY, DD.MM.YYYY',
                        'וודא שכל השדות החובה מלאים: מספר ציוד, סוג, יצרן, דגם, מספר סידורי',
                    ].map((instruction, i) => (
                        <ListItem key={i} disableGutters sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Typography variant="body2" fontWeight={700} color="primary.main">
                                    {i + 1}.
                                </Typography>
                            </ListItemIcon>
                            <ListItemText primary={instruction} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default EquipmentImport;
