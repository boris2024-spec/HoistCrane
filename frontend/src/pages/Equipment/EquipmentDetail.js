import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Button, Chip, Tabs, Tab } from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { equipmentAPI } from '../../services/api';
import InspectionList from '../Inspections/InspectionList';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchEquipment();
    }, [id]);

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

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!equipment) {
        return <Typography>Equipment not found</Typography>;
    }

    const InfoRow = ({ label, value }) => (
        <Grid container spacing={2} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
            <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={8}>
                <Typography variant="body1">
                    {value || '-'}
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button startIcon={<BackIcon />} onClick={() => navigate('/equipment')}>
                        חזרה
                    </Button>
                    <Typography variant="h4">
                        {equipment.equipment_number}
                    </Typography>
                    <Chip label={equipment.status} color="primary" />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/equipment/${id}/edit`)}
                >
                    ערוך
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="פרטים כלליים" />
                <Tab label="בדיקות" />
                <Tab label="מסמכים" />
                <Tab label="תקלות" />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        פרטי יצרן
                    </Typography>
                    <InfoRow label="יצרן" value={equipment.manufacturer} />
                    <InfoRow label="דגם" value={equipment.model} />
                    <InfoRow label="מספר סידורי" value={equipment.serial_number} />
                    <InfoRow label="שנת ייצור" value={equipment.manufacture_year} />
                    <InfoRow label="תאריך ייצור" value={equipment.manufacture_date} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        מפרט טכני
                    </Typography>
                    <InfoRow label="קיבולת" value={equipment.capacity ? `${equipment.capacity} ${equipment.capacity_unit}` : '-'} />
                    <InfoRow label="גובה" value={equipment.height ? `${equipment.height} מ'` : '-'} />
                    <InfoRow label="לחץ עבודה" value={equipment.working_pressure} />
                    <InfoRow label="נפח" value={equipment.volume} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        מיקום ובעלות
                    </Typography>
                    <InfoRow label="אתר" value={equipment.site_name} />
                    <InfoRow label="מקום עבודה" value={equipment.workplace_name} />
                    <InfoRow label="מעביד" value={equipment.employer} />
                    <InfoRow label="מחלקה" value={equipment.department} />

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        תאריכים
                    </Typography>
                    <InfoRow label="תאריך רכישה" value={equipment.purchase_date} />
                    <InfoRow label="תאריך התקנה" value={equipment.installation_date} />
                    <InfoRow label="בדיקה אחרונה" value={equipment.last_inspection_date} />
                    <InfoRow label="בדיקה הבאה" value={equipment.next_inspection_date} />
                    <InfoRow label="בודק" value={equipment.inspector_name} />

                    {equipment.description && (
                        <>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                תאור
                            </Typography>
                            <Typography variant="body1">{equipment.description}</Typography>
                        </>
                    )}

                    {equipment.notes && (
                        <>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                הערות
                            </Typography>
                            <Typography variant="body1">{equipment.notes}</Typography>
                        </>
                    )}
                </Paper>
            )}

            {tabValue === 1 && (
                <InspectionList equipmentId={id} />
            )}

            {tabValue === 2 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1">
                        מסמכים יוצגו כאן
                    </Typography>
                </Paper>
            )}

            {tabValue === 3 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1">
                        תקלות יוצגו כאן
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default EquipmentDetail;
