import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Button, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Grid, Alert,
    CircularProgress, Card, CardContent, Tooltip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    CheckCircle as ResolveIcon, Report as ReportIcon,
    Warning as WarningIcon, Error as ErrorIcon,
    PriorityHigh as HighPriorityIcon, Schedule as ScheduleIcon
} from '@mui/icons-material';
import { issueAPI, equipmentAPI } from '../../services/api';
import { useThemeMode } from '../../context/ThemeContext';

const IssueList = () => {
    const { mode } = useThemeMode();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIssue, setEditingIssue] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        equipment: '', title: '', description: '', priority: 'medium', status: 'open',
    });

    useEffect(() => {
        fetchIssues();
        fetchEquipment();
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await issueAPI.list();
            setIssues(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError('שגיאה בטעינת תקלות');
        } finally {
            setLoading(false);
        }
    };

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.list({ page_size: 1000 });
            setEquipmentList(response.data.results || []);
        } catch (err) { console.error('Error fetching equipment:', err); }
    };

    const handleOpenNew = () => {
        setEditingIssue(null);
        setFormData({ equipment: '', title: '', description: '', priority: 'medium', status: 'open' });
        setOpenDialog(true);
    };

    const handleEdit = (issue) => {
        setEditingIssue(issue);
        setFormData({
            equipment: issue.equipment || '',
            title: issue.title || '',
            description: issue.description || '',
            priority: issue.priority || 'medium',
            status: issue.status || 'open',
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        try {
            if (editingIssue) {
                await issueAPI.update(editingIssue.id, formData);
                setSuccess('התקלה עודכנה בהצלחה');
            } else {
                await issueAPI.create(formData);
                setSuccess('התקלה נוצרה בהצלחה');
            }
            setOpenDialog(false);
            fetchIssues();
        } catch (err) {
            setError(err.response?.data?.error || 'שגיאה בשמירת התקלה');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק תקלה זו?')) return;
        try {
            await issueAPI.update(id, { status: 'closed' });
            setSuccess('התקלה נסגרה');
            fetchIssues();
        } catch (err) {
            setError('שגיאה בסגירת התקלה');
        }
    };

    const handleResolve = async (id) => {
        try {
            await issueAPI.resolve(id, 'טופל');
            setSuccess('התקלה סומנה כפתורה');
            fetchIssues();
        } catch (err) {
            setError('שגיאה בעדכון התקלה');
        }
    };

    const priorityConfig = {
        low: { label: 'נמוכה', color: 'info', icon: <ScheduleIcon fontSize="small" /> },
        medium: { label: 'בינונית', color: 'warning', icon: <WarningIcon fontSize="small" /> },
        high: { label: 'גבוהה', color: 'error', icon: <HighPriorityIcon fontSize="small" /> },
        critical: { label: 'קריטית', color: 'error', icon: <ErrorIcon fontSize="small" /> },
    };

    const statusConfig = {
        open: { label: 'פתוחה', color: 'error' },
        in_progress: { label: 'בטיפול', color: 'warning' },
        resolved: { label: 'נפתרה', color: 'success' },
        closed: { label: 'סגורה', color: 'default' },
    };

    const getPriorityInfo = (p) => priorityConfig[p] || priorityConfig.medium;
    const getStatusInfo = (s) => statusConfig[s] || statusConfig.open;

    const openCount = issues.filter(i => i.status === 'open').length;
    const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
    const resolvedCount = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>תקלות</Typography>
                    <Typography variant="body2" color="text.secondary">ניהול ומעקב אחר תקלות ובעיות</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}
                    sx={{ borderRadius: 2, fontWeight: 600 }}>
                    דווח תקלה חדשה
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'פתוחות', value: openCount, color: '#ef4444', icon: <ReportIcon /> },
                    { label: 'בטיפול', value: inProgressCount, color: '#f59e0b', icon: <ScheduleIcon /> },
                    { label: 'נפתרו', value: resolvedCount, color: '#22c55e', icon: <ResolveIcon /> },
                ].map((stat) => (
                    <Grid item xs={12} sm={4} key={stat.label}>
                        <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    bgcolor: stat.color + '15', color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress color="primary" />
                </Box>
            ) : issues.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>אין תקלות פתוחות</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>המערכת פועלת תקין</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenNew}>דווח תקלה ראשונה</Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: mode === 'dark' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>כותרת</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>ציוד</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>עדיפות</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>סטטוס</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תאריך</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>תאור</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {issues.map((issue) => {
                                const priority = getPriorityInfo(issue.priority);
                                const status = getStatusInfo(issue.status);
                                return (
                                    <TableRow key={issue.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{issue.title || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{issue.equipment_number || issue.equipment_name || '-'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip icon={priority.icon} label={priority.label} color={priority.color} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={status.label} color={status.color} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {issue.created_at ? new Date(issue.created_at).toLocaleDateString('he-IL') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                                {issue.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={0.5} justifyContent="center">
                                                {issue.status !== 'resolved' && issue.status !== 'closed' && (
                                                    <Tooltip title="סמן כנפתר">
                                                        <IconButton size="small" color="success" onClick={() => handleResolve(issue.id)}>
                                                            <ResolveIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="ערוך">
                                                    <IconButton size="small" color="primary" onClick={() => handleEdit(issue)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="סגור">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(issue.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editingIssue ? 'עריכת תקלה' : 'דיווח תקלה חדשה'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth required label="כותרת" value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth select label="ציוד" value={formData.equipment}
                                onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}>
                                <MenuItem value=""><em>ללא</em></MenuItem>
                                {equipmentList.map(eq => (
                                    <MenuItem key={eq.id} value={eq.id}>
                                        {eq.equipment_number} - {eq.description || eq.model || ''}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth select label="עדיפות" value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}>
                                <MenuItem value="low">נמוכה</MenuItem>
                                <MenuItem value="medium">בינונית</MenuItem>
                                <MenuItem value="high">גבוהה</MenuItem>
                                <MenuItem value="critical">קריטית</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth select label="סטטוס" value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                                <MenuItem value="open">פתוחה</MenuItem>
                                <MenuItem value="in_progress">בטיפול</MenuItem>
                                <MenuItem value="resolved">נפתרה</MenuItem>
                                <MenuItem value="closed">סגורה</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={4} label="תאור מפורט" value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} variant="text">ביטול</Button>
                    <Button onClick={handleSave} variant="contained">{editingIssue ? 'עדכן' : 'צור תקלה'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IssueList;
