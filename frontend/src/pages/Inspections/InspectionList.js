import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogContent,
    DialogTitle, Tooltip, CircularProgress, Alert
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { inspectionAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';
import InspectionForm from './InspectionForm';

const InspectionList = ({ equipmentId }) => {
    const { mode } = useThemeMode();
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => { fetchInspections(); }, [equipmentId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchInspections = async () => {
        try {
            const params = equipmentId ? { equipment: equipmentId } : {};
            const response = await inspectionAPI.list(params);
            setInspections(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching inspections:', err);
            setError('שגיאה בטעינת הבדיקות');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => { setSelectedInspection(null); setOpenDialog(true); };
    const handleEdit = (inspection) => { setSelectedInspection(inspection); setOpenDialog(true); };

    const handleDelete = async (id) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק בדיקה זו?')) {
            try {
                await inspectionAPI.delete(id);
                fetchInspections();
            } catch (err) {
                console.error('Error deleting inspection:', err);
                setError('שגיאה במחיקת הבדיקה');
            }
        }
    };

    const handleSave = () => { setOpenDialog(false); fetchInspections(); };

    const getResultLabel = (result) => ({
        'pass': 'תקינה ללא הערות', 'conditional': 'תקינה עם הערות', 'fail': 'נכשלה'
    }[result] || result);

    const getResultColor = (result) => ({
        'pass': 'success', 'conditional': 'warning', 'fail': 'error'
    }[result] || 'default');

    const getInspectionTypeLabel = (type) => ({
        'annual': 'שנתית', 'periodic': 'תקופתית', 'post_repair': 'אחרי תיקון', 'pre_operation': 'לפני הפעלה'
    }[type] || type);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>בדיקות תקופתיות ותחזוקה</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}
                    sx={{ borderRadius: 2, fontWeight: 600 }}>
                    הוסף בדיקה
                </Button>
            </Box>

            {inspections.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>אין בדיקות להצגה</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>הוסף בדיקה ראשונה לציוד זה</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>הוסף בדיקה</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: mode === 'dark' ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>טופס</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>סוג בדיקה</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>סטטוס</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>בודק</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תאריך בדיקה</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תפוגת תוקף</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>יחידות</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>מד מרחק</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>שעות עבודה</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inspections.map((inspection) => (
                                <TableRow key={inspection.id} hover>
                                    <TableCell>{inspection.equipment_number || '-'}</TableCell>
                                    <TableCell>{getInspectionTypeLabel(inspection.inspection_type)}</TableCell>
                                    <TableCell>
                                        <Chip label={getResultLabel(inspection.result)} color={getResultColor(inspection.result)} size="small" />
                                    </TableCell>
                                    <TableCell>{inspection.inspector_name}</TableCell>
                                    <TableCell>{new Date(inspection.inspection_date).toLocaleDateString('he-IL')}</TableCell>
                                    <TableCell>{inspection.next_due_date ? new Date(inspection.next_due_date).toLocaleDateString('he-IL') : '-'}</TableCell>
                                    <TableCell>{inspection.units || '-'}</TableCell>
                                    <TableCell>{inspection.mileage || '-'}</TableCell>
                                    <TableCell>{inspection.working_hours || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" gap={0.5} justifyContent="center">
                                            {inspection.attachment && (
                                                <Tooltip title="צפה בקובץ מצורף">
                                                    <IconButton size="small" onClick={() => window.open(inspection.attachment, '_blank')} color="success">
                                                        <AttachFileIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="ערוך">
                                                <IconButton size="small" onClick={() => handleEdit(inspection)} color="primary">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="מחק">
                                                <IconButton size="small" onClick={() => handleDelete(inspection.id)} color="error">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
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
