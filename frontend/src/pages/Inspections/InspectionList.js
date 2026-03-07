import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogContent,
    DialogTitle
} from '@mui/material';
import { 
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    AttachFile as AttachFileIcon 
} from '@mui/icons-material';
import axios from 'axios';
import InspectionForm from './InspectionForm';

const InspectionList = ({ equipmentId }) => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);

    useEffect(() => {
        fetchInspections();
    }, [equipmentId]);

    const fetchInspections = async () => {
        try {
            const params = equipmentId ? { equipment: equipmentId } : {};
            const response = await axios.get('/api/inspections/', { params });
            setInspections(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching inspections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedInspection(null);
        setOpenDialog(true);
    };

    const handleEdit = (inspection) => {
        setSelectedInspection(inspection);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק בדיקה זו?')) {
            try {
                await axios.delete(`/api/inspections/${id}/`);
                fetchInspections();
            } catch (error) {
                console.error('Error deleting inspection:', error);
                alert('שגיאה במחיקת הבדיקה');
            }
        }
    };

    const handleSave = () => {
        setOpenDialog(false);
        fetchInspections();
    };

    const getResultLabel = (result) => {
        const labels = {
            'pass': 'תקינה ללא הערות',
            'conditional': 'תקינה עם הערות',
            'fail': 'נכשלה'
        };
        return labels[result] || result;
    };

    const getResultColor = (result) => {
        const colors = {
            'pass': 'success',
            'conditional': 'warning',
            'fail': 'error'
        };
        return colors[result] || 'default';
    };

    const getInspectionTypeLabel = (type) => {
        const labels = {
            'annual': 'שנתית',
            'periodic': 'תקופתית',
            'post_repair': 'אחרי תיקון',
            'pre_operation': 'לפני הפעלה'
        };
        return labels[type] || type;
    };

    if (loading) {
        return <Typography>טוען...</Typography>;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    בדיקות תקופתיות ותחזוקה
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{ 
                        bgcolor: '#4CAF50',
                        '&:hover': { bgcolor: '#45a049' }
                    }}
                >
                    הוסף בדיקה
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ border: '2px solid #f97316' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f97316' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>טופס</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>דרישה</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>סטטוס</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>תאור</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>תאריך</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>פגיעת תוקף</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>יחידות</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>מד מרחק</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>שעות עבודה</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>הערה</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inspections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        אין בדיקות להצגה
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            inspections.map((inspection, index) => (
                                <TableRow key={inspection.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                                    <TableCell>
                                        {inspection.equipment_number || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {getInspectionTypeLabel(inspection.inspection_type)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getResultLabel(inspection.result)}
                                            color={getResultColor(inspection.result)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {inspection.inspector_name}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(inspection.inspection_date).toLocaleDateString('he-IL')}
                                    </TableCell>
                                    <TableCell>
                                        {inspection.next_due_date ? 
                                            new Date(inspection.next_due_date).toLocaleDateString('he-IL') : 
                                            '-'
                                        }
                                    </TableCell>
                                    <TableCell>{inspection.units || '-'}</TableCell>
                                    <TableCell>{inspection.mileage || '-'}</TableCell>
                                    <TableCell>{inspection.working_hours || '-'}</TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1} alignItems="center">
                                            {inspection.attachment && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => window.open(inspection.attachment, '_blank')}
                                                    sx={{ color: '#4CAF50' }}
                                                    title="צפה בקובץ מצורף"
                                                >
                                                    <AttachFileIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(inspection)}
                                                sx={{ color: '#1976d2' }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(inspection.id)}
                                                sx={{ color: '#d32f2f' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for Add/Edit */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedInspection ? 'עריכת בדיקה' : 'הוספת בדיקה חדשה'}
                </DialogTitle>
                <DialogContent>
                    <InspectionForm
                        equipmentId={equipmentId}
                        inspection={selectedInspection}
                        onSave={handleSave}
                        onCancel={() => setOpenDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default InspectionList;
