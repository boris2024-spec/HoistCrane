import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Button, Chip, Tabs, Tab,
    CircularProgress, Divider, useMediaQuery, useTheme, Stack, IconButton, Menu, MenuItem
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
    Edit as EditIcon, ArrowBack as BackIcon, Delete as DeleteIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { equipmentAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';
import InspectionList from '../Inspections/InspectionList';
import DocumentList from '../Documents/DocumentList';
import IssueList from '../Issues/IssueList';

const statusLabels = {
    active: 'פעיל', maintenance: 'בתחזוקה', inactive: 'לא פעיל', retired: 'הוצא משימוש',
};
const statusColors = {
    active: 'success', maintenance: 'warning', inactive: 'default', retired: 'error',
};
const typeLabels = {
    crane: 'מנוף', hoist: 'מנוף רמה', forklift: 'מלגזה',
    elevator: 'מעלית', platform: 'במה', other: 'אחר',
};

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [moreAnchor, setMoreAnchor] = useState(null);

    useEffect(() => { fetchEquipment(); }, [id]);

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.get(id);
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק ציוד זה?')) {
            try {
                await equipmentAPI.delete(id);
                navigate('/equipment');
            } catch (err) {
                alert('שגיאה במחיקת הציוד');
            }
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await equipmentAPI.generatePDF(id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `equipment_card_${equipment?.equipment_number || id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('שגיאה בהורדת PDF');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('he-IL');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!equipment) {
        return (
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">הציוד לא נמצא</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/equipment')}>חזרה לרשימה</Button>
            </Box>
        );
    }

    const InfoRow = ({ label, value }) => (
        <Grid container spacing={isMobile ? 0.5 : 2} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid item xs={isMobile ? 12 : 4}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
            </Grid>
            <Grid item xs={isMobile ? 12 : 8}>
                <Typography variant="body1" sx={isMobile ? { mb: 0.5 } : {}}>{value || '-'}</Typography>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            {/* Header */}
            <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'stretch' : 'center'}
                mb={3}
                gap={2}
            >
                <Box display="flex" alignItems={isMobile ? 'flex-start' : 'center'} gap={isMobile ? 1 : 2} flexDirection={isMobile ? 'column' : 'row'}>
                    <Button startIcon={<BackIcon />} onClick={() => navigate('/equipment')} variant="text" size={isMobile ? 'small' : 'medium'}>
                        חזרה
                    </Button>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>
                                {equipment.equipment_number}
                            </Typography>
                            <Chip
                                label={statusLabels[equipment.status] || equipment.status}
                                color={statusColors[equipment.status] || 'default'}
                                size="small"
                            />
                        </Box>
                        {equipment.equipment_type && (
                            <Typography variant="body2" color="text.secondary">
                                {typeLabels[equipment.equipment_type] || equipment.equipment_type}
                                {equipment.manufacturer ? ` • ${equipment.manufacturer}` : ''}
                                {equipment.model ? ` ${equipment.model}` : ''}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Desktop action buttons */}
                {!isMobile && (
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>מחק</Button>
                        <Button variant="outlined" color="secondary" startIcon={<PdfIcon />} onClick={handleDownloadPDF}>הורד PDF</Button>
                        <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/equipment/${id}/edit`)}>ערוך</Button>
                    </Box>
                )}

                {/* Mobile action buttons */}
                {isMobile && (
                    <Box display="flex" gap={1} justifyContent="stretch">
                        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/equipment/${id}/edit`)} sx={{ flex: 1 }}>ערוך</Button>
                        <Button variant="outlined" size="small" startIcon={<PdfIcon />} onClick={handleDownloadPDF} sx={{ flex: 1 }}>PDF</Button>
                        <IconButton size="small" onClick={(e) => setMoreAnchor(e.currentTarget)}><MoreVertIcon /></IconButton>
                        <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
                            <MenuItem onClick={() => { handleDelete(); setMoreAnchor(null); }} sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> מחק
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Box>

            {/* Tabs */}
            <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons={isMobile ? 'auto' : false}
                allowScrollButtonsMobile
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { fontWeight: 600, fontSize: isMobile ? '0.8rem' : '0.9rem', minWidth: isMobile ? 80 : 90 },
                }}
            >
                <Tab label="פרטים כלליים" />
                <Tab label="בדיקות" />
                <Tab label="מסמכים" />
                <Tab label="תקלות" />
            </Tabs>

            {/* General Info */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>פרטי יצרן</Typography>
                            <InfoRow label="יצרן" value={equipment.manufacturer} />
                            <InfoRow label="דגם" value={equipment.model} />
                            <InfoRow label="מספר סידורי" value={equipment.serial_number} />
                            <InfoRow label="שנת ייצור" value={equipment.manufacture_year} />
                            <InfoRow label="תאריך ייצור" value={formatDate(equipment.manufacture_date)} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>מפרט טכני</Typography>
                            <InfoRow label="קיבולת" value={equipment.capacity ? `${equipment.capacity} ${equipment.capacity_unit || 'ק"ג'}` : '-'} />
                            <InfoRow label="גובה" value={equipment.height ? `${equipment.height} מ'` : '-'} />
                            <InfoRow label="לחץ עבודה" value={equipment.working_pressure} />
                            <InfoRow label="נפח" value={equipment.volume} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>מיקום ובעלות</Typography>
                            <InfoRow label="אתר" value={equipment.site_name} />
                            <InfoRow label="מקום עבודה" value={equipment.workplace_name} />
                            <InfoRow label="מעביד" value={equipment.employer} />
                            <InfoRow label="מחלקה" value={equipment.department} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>תאריכים</Typography>
                            <InfoRow label="תאריך רכישה" value={formatDate(equipment.purchase_date)} />
                            <InfoRow label="תאריך התקנה" value={formatDate(equipment.installation_date)} />
                            <InfoRow label="בדיקה אחרונה" value={formatDate(equipment.last_inspection_date)} />
                            <InfoRow label="בדיקה הבאה" value={formatDate(equipment.next_inspection_date)} />
                            <InfoRow label="בודק" value={equipment.inspector_name} />
                        </Paper>
                    </Grid>

                    {(equipment.description || equipment.notes) && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                                {equipment.description && (
                                    <Box mb={equipment.notes ? 3 : 0}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>תאור</Typography>
                                        <Typography variant="body1">{equipment.description}</Typography>
                                    </Box>
                                )}
                                {equipment.description && equipment.notes && <Divider sx={{ my: 2 }} />}
                                {equipment.notes && (
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} gutterBottom>הערות</Typography>
                                        <Typography variant="body1">{equipment.notes}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {tabValue === 1 && <InspectionList equipmentId={id} />}
            {tabValue === 2 && <DocumentList equipmentId={id} />}
            {tabValue === 3 && <IssueList />}
        </Box>
    );
};

export default EquipmentDetail;
