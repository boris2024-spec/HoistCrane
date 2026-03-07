import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Grid, Button, Chip, Tabs, Tab,
    CircularProgress, Divider
} from '@mui/material';
import {
    Edit as EditIcon, ArrowBack as BackIcon, Delete as DeleteIcon
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
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

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
        <Grid container spacing={2} sx={{ py: 1.2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
            </Grid>
            <Grid item xs={8}>
                <Typography variant="body1">{value || '-'}</Typography>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button startIcon={<BackIcon />} onClick={() => navigate('/equipment')} variant="text">
                        חזרה
                    </Button>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="h4" fontWeight={700}>
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
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                    >
                        מחק
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/equipment/${id}/edit`)}
                    >
                        ערוך
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem' },
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
                        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>פרטי יצרן</Typography>
                            <InfoRow label="יצרן" value={equipment.manufacturer} />
                            <InfoRow label="דגם" value={equipment.model} />
                            <InfoRow label="מספר סידורי" value={equipment.serial_number} />
                            <InfoRow label="שנת ייצור" value={equipment.manufacture_year} />
                            <InfoRow label="תאריך ייצור" value={formatDate(equipment.manufacture_date)} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>מפרט טכני</Typography>
                            <InfoRow label="קיבולת" value={equipment.capacity ? `${equipment.capacity} ${equipment.capacity_unit || 'ק"ג'}` : '-'} />
                            <InfoRow label="גובה" value={equipment.height ? `${equipment.height} מ'` : '-'} />
                            <InfoRow label="לחץ עבודה" value={equipment.working_pressure} />
                            <InfoRow label="נפח" value={equipment.volume} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>מיקום ובעלות</Typography>
                            <InfoRow label="אתר" value={equipment.site_name} />
                            <InfoRow label="מקום עבודה" value={equipment.workplace_name} />
                            <InfoRow label="מעביד" value={equipment.employer} />
                            <InfoRow label="מחלקה" value={equipment.department} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%' }}>
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
                            <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
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
            {tabValue === 2 && <DocumentList />}
            {tabValue === 3 && <IssueList />}
        </Box>
    );
};

export default EquipmentDetail;
