import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Alert, Tooltip, CircularProgress,
    MenuItem, Grid
} from '@mui/material';
import {
    CloudUpload as UploadIcon, Delete as DeleteIcon, Visibility as ViewIcon,
    FileDownload as DownloadIcon, Description as FileIcon,
    PictureAsPdf as PdfIcon, Image as ImageIcon,
    InsertDriveFile as GenericFileIcon, Add as AddIcon
} from '@mui/icons-material';
import { documentAPI, equipmentAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const DocumentList = ({ equipmentId }) => {
    const { mode } = useThemeMode();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openUpload, setOpenUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadData, setUploadData] = useState({ title: '', description: '', document_type: 'other', equipment: '' });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);

    useEffect(() => { fetchDocuments(); }, [equipmentId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!equipmentId) {
            equipmentAPI.list({ page_size: 1000 }).then(res => {
                setEquipmentList(res.data.results || res.data || []);
            }).catch(() => { });
        }
    }, [equipmentId]);

    const fetchDocuments = async () => {
        try {
            const params = equipmentId ? { equipment: equipmentId } : {};
            const response = await documentAPI.list(params);
            setDocuments(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('שגיאה בטעינת מסמכים');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) { setError('אנא בחר קובץ'); return; }
        const eqId = equipmentId || uploadData.equipment;
        if (!eqId) { setError('אנא בחר ציוד'); return; }
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('title', uploadData.title || uploadFile.name);
            formData.append('description', uploadData.description);
            formData.append('document_type', uploadData.document_type);
            formData.append('equipment', eqId);
            await documentAPI.upload(formData);
            setSuccess('המסמך הועלה בהצלחה');
            setOpenUpload(false);
            setUploadFile(null);
            setUploadData({ title: '', description: '', document_type: 'other', equipment: '' });
            fetchDocuments();
        } catch (err) {
            setError(err.response?.data?.error || 'שגיאה בהעלאת המסמך');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק מסמך זה?')) return;
        try {
            await documentAPI.delete(id);
            setSuccess('המסמך נמחק בהצלחה');
            fetchDocuments();
        } catch (err) {
            setError('שגיאה במחיקת המסמך');
        }
    };

    const getFileIcon = (filename) => {
        if (!filename) return <GenericFileIcon />;
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <PdfIcon sx={{ color: '#ef4444' }} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon sx={{ color: '#3b82f6' }} />;
        return <FileIcon sx={{ color: '#f59e0b' }} />;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('he-IL');
    };

    const formatSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const documentTypes = [
        { value: 'manual', label: 'מדריך' },
        { value: 'certificate', label: 'תעודה' },
        { value: 'inspection', label: 'דוח בדיקה' },
        { value: 'warranty', label: 'אחריות' },
        { value: 'maintenance', label: 'תחזוקה' },
        { value: 'photo', label: 'תמונה' },
        { value: 'drawing', label: 'שרטוט טכני' },
        { value: 'other', label: 'אחר' },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>מסמכים</Typography>
                    <Typography variant="body2" color="text.secondary">ניהול מסמכים, תעודות ודוחות</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenUpload(true)}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                    העלה מסמך
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress color="primary" />
                </Box>
            ) : documents.length === 0 ? (
                <Paper sx={{
                    p: 6, textAlign: 'center', borderRadius: 3,
                    border: 1, borderColor: 'divider',
                }}>
                    <FileIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        אין מסמכים להצגה
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        התחל בהעלאת מסמכים למערכת
                    </Typography>
                    <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setOpenUpload(true)}>
                        העלה מסמך ראשון
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: mode === 'dark' ? 'rgba(74,222,128,0.08)' : 'rgba(34,197,94,0.06)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>מסמך</TableCell>
                                {!equipmentId && <TableCell sx={{ fontWeight: 700 }}>ציוד</TableCell>}
                                <TableCell sx={{ fontWeight: 700 }}>סוג</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תאריך העלאה</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>גודל</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תאור</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            {getFileIcon(doc.file || doc.title)}
                                            <Typography variant="body2" fontWeight={500}>
                                                {doc.title || doc.file?.split('/').pop() || '-'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    {!equipmentId && (
                                        <TableCell>
                                            <Typography variant="body2">{doc.equipment_number || '-'}</Typography>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Chip
                                            label={documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type || 'כללי'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(doc.created_at || doc.uploaded_at)}</TableCell>
                                    <TableCell>{formatSize(doc.file_size)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                            {doc.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" gap={0.5} justifyContent="center">
                                            {doc.file && (
                                                <>
                                                    <Tooltip title="צפה">
                                                        <IconButton size="small" onClick={() => window.open(doc.file, '_blank')}>
                                                            <ViewIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="הורד">
                                                        <IconButton size="small" color="primary" component="a" href={doc.file} download>
                                                            <DownloadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="מחק">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
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

            {/* Upload Dialog */}
            <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>העלאת מסמך חדש</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {!equipmentId && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="ציוד"
                                    value={uploadData.equipment}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, equipment: e.target.value }))}
                                    required
                                >
                                    {equipmentList.map(eq => (
                                        <MenuItem key={eq.id} value={eq.id}>
                                            {eq.equipment_number} {eq.manufacturer ? `- ${eq.manufacturer}` : ''} {eq.model || ''}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="שם מסמך"
                                value={uploadData.title}
                                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="סוג מסמך"
                                value={uploadData.document_type}
                                onChange={(e) => setUploadData(prev => ({ ...prev, document_type: e.target.value }))}
                            >
                                {documentTypes.map(t => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="תאור"
                                value={uploadData.description}
                                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<UploadIcon />}
                                sx={{ py: 2, borderStyle: 'dashed' }}
                            >
                                {uploadFile ? uploadFile.name : 'בחר קובץ'}
                                <input type="file" hidden onChange={(e) => setUploadFile(e.target.files[0])} />
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenUpload(false)} variant="text">ביטול</Button>
                    <Button onClick={handleUpload} variant="contained" disabled={!uploadFile || uploading} startIcon={<UploadIcon />}>
                        {uploading ? 'מעלה...' : 'העלה'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentList;
