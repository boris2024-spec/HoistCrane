import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, IconButton, Tooltip, Tabs, Tab, List, ListItem,
    ListItemText, ListItemIcon, Skeleton, Divider, FormControl,
    InputLabel, Select
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon, Add as AddIcon,
    Warning as WarningIcon, CheckCircle as CheckIcon,
    Schedule as ScheduleIcon, Edit as EditIcon,
    ChevronLeft, ChevronRight, Build as BuildIcon
} from '@mui/icons-material';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday,
    addMonths, subMonths, isSameDay, parseISO, getDay
} from 'date-fns';
import { he } from 'date-fns/locale';
import { maintenanceAPI } from '../../services/api';

const PRIORITY_COLORS = {
    low: '#22c55e',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444',
};

const PRIORITY_LABELS = {
    low: 'נמוכה',
    medium: 'בינונית',
    high: 'גבוהה',
    critical: 'קריטית',
};

const STATUS_LABELS = {
    pending: 'ממתין',
    in_progress: 'בביצוע',
    completed: 'הושלם',
    overdue: 'באיחור',
    cancelled: 'בוטל',
};

const STATUS_COLORS = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    completed: '#22c55e',
    overdue: '#ef4444',
    cancelled: '#94a3b8',
};

const MaintenanceCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', equipment: '', priority: 'medium',
        status: 'pending', due_date: '', notes: '',
    });

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
            const [calRes, overdueRes] = await Promise.allSettled([
                maintenanceAPI.tasks.calendar(start, end),
                maintenanceAPI.tasks.overdue(),
            ]);
            if (calRes.status === 'fulfilled') {
                setTasks(calRes.value.data?.results || calRes.value.data || []);
            }
            if (overdueRes.status === 'fulfilled') {
                setOverdueTasks(overdueRes.value.data?.results || overdueRes.value.data || []);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await maintenanceAPI.tasks.update(taskId, { status: newStatus });
            fetchTasks();
            setSelectedTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleCreateTask = async () => {
        try {
            await maintenanceAPI.tasks.create(formData);
            setDialogOpen(false);
            setFormData({ title: '', description: '', equipment: '', priority: 'medium', status: 'pending', due_date: '', notes: '' });
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start of the calendar to align with the day of week
    const startDay = getDay(monthStart);
    const paddedDays = Array(startDay).fill(null).concat(daysInMonth);

    const getTasksForDay = (day) => {
        if (!day) return [];
        const dayStr = format(day, 'yyyy-MM-dd');
        return tasks.filter(t => t.due_date === dayStr);
    };

    const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>תחזוקה</Typography>
                    <Typography variant="body1" color="text.secondary">ניהול משימות תחזוקה ולוח זמנים</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 2 }}>
                    משימה חדשה
                </Button>
            </Box>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab icon={<CalendarIcon />} iconPosition="start" label="לוח שנה" />
                <Tab icon={<WarningIcon />} iconPosition="start" label={`באיחור (${overdueTasks.length})`} />
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    {/* Calendar Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronRight /></IconButton>
                        <Typography variant="h6" fontWeight={600}>
                            {format(currentDate, 'MMMM yyyy', { locale: he })}
                        </Typography>
                        <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronLeft /></IconButton>
                    </Box>

                    {/* Day Headers */}
                    <Grid container spacing={0.5} sx={{ mb: 1 }}>
                        {dayNames.map((d) => (
                            <Grid item xs={12 / 7} key={d}>
                                <Typography variant="caption" fontWeight={700} textAlign="center" display="block" color="text.secondary">
                                    {d}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Calendar Grid */}
                    {loading ? (
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    ) : (
                        <Grid container spacing={0.5}>
                            {paddedDays.map((day, idx) => {
                                const dayTasks = day ? getTasksForDay(day) : [];
                                return (
                                    <Grid item xs={12 / 7} key={idx}>
                                        <Box
                                            sx={{
                                                minHeight: 80, p: 0.5, borderRadius: 1,
                                                border: 1, borderColor: day && isToday(day) ? 'primary.main' : 'divider',
                                                bgcolor: day ? (isToday(day) ? 'primary.main' + '08' : 'transparent') : 'transparent',
                                                opacity: day ? 1 : 0,
                                            }}
                                        >
                                            {day && (
                                                <>
                                                    <Typography variant="caption" fontWeight={isToday(day) ? 700 : 400}
                                                        color={isToday(day) ? 'primary.main' : 'text.secondary'}
                                                        sx={{ display: 'block', textAlign: 'center', mb: 0.5, fontSize: '0.75rem' }}
                                                    >
                                                        {format(day, 'd')}
                                                    </Typography>
                                                    {dayTasks.slice(0, 2).map((task) => (
                                                        <Chip
                                                            key={task.id}
                                                            label={task.title}
                                                            size="small"
                                                            onClick={() => setSelectedTask(task)}
                                                            sx={{
                                                                width: '100%', mb: 0.25, height: 18,
                                                                fontSize: '0.6rem', fontWeight: 500,
                                                                bgcolor: (PRIORITY_COLORS[task.priority] || '#94a3b8') + '20',
                                                                color: PRIORITY_COLORS[task.priority] || '#94a3b8',
                                                                cursor: 'pointer',
                                                                '& .MuiChip-label': { px: 0.5 },
                                                            }}
                                                        />
                                                    ))}
                                                    {dayTasks.length > 2 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textAlign: 'center', display: 'block' }}>
                                                            +{dayTasks.length - 2} עוד
                                                        </Typography>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Paper>
            )}

            {tabValue === 1 && (
                <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
                    {overdueTasks.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <CheckIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
                            <Typography variant="h6" fontWeight={600}>אין משימות באיחור</Typography>
                            <Typography variant="body2" color="text.secondary">כל המשימות מעודכנות</Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {overdueTasks.map((task, idx) => (
                                <React.Fragment key={task.id}>
                                    {idx > 0 && <Divider />}
                                    <ListItem
                                        sx={{ px: 0, py: 1.5, cursor: 'pointer' }}
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <WarningIcon sx={{ color: PRIORITY_COLORS[task.priority] || '#f59e0b' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={`${task.equipment_number || ''} • יעד: ${task.due_date}`}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip label={PRIORITY_LABELS[task.priority] || task.priority} size="small"
                                                sx={{ bgcolor: (PRIORITY_COLORS[task.priority] || '#94a3b8') + '20', color: PRIORITY_COLORS[task.priority] }} />
                                            <Chip label={STATUS_LABELS[task.status] || task.status} size="small"
                                                sx={{ bgcolor: (STATUS_COLORS[task.status] || '#94a3b8') + '20', color: STATUS_COLORS[task.status] }} />
                                        </Box>
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            )}

            {/* Task Detail Dialog */}
            <Dialog open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} maxWidth="sm" fullWidth>
                {selectedTask && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700 }}>{selectedTask.title}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">ציוד</Typography>
                                    <Typography variant="body2" fontWeight={500}>{selectedTask.equipment_number || '-'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">תאריך יעד</Typography>
                                    <Typography variant="body2" fontWeight={500}>{selectedTask.due_date}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">עדיפות</Typography>
                                    <Chip label={PRIORITY_LABELS[selectedTask.priority]} size="small"
                                        sx={{ bgcolor: (PRIORITY_COLORS[selectedTask.priority] || '#94a3b8') + '20', color: PRIORITY_COLORS[selectedTask.priority] }} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">סטטוס</Typography>
                                    <Chip label={STATUS_LABELS[selectedTask.status]} size="small"
                                        sx={{ bgcolor: (STATUS_COLORS[selectedTask.status] || '#94a3b8') + '20', color: STATUS_COLORS[selectedTask.status] }} />
                                </Grid>
                                {selectedTask.description && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">תיאור</Typography>
                                        <Typography variant="body2">{selectedTask.description}</Typography>
                                    </Grid>
                                )}
                                {selectedTask.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">הערות</Typography>
                                        <Typography variant="body2">{selectedTask.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                            {selectedTask.status !== 'completed' && (
                                <Button variant="contained" color="success" onClick={() => handleUpdateStatus(selectedTask.id, 'completed')}>
                                    סמן כהושלם
                                </Button>
                            )}
                            {selectedTask.status === 'pending' && (
                                <Button variant="outlined" onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}>
                                    התחל ביצוע
                                </Button>
                            )}
                            <Button onClick={() => setSelectedTask(null)}>סגור</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Create Task Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>משימת תחזוקה חדשה</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="כותרת" value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="תיאור" multiline rows={2} value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="תאריך יעד" type="date" InputLabelProps={{ shrink: true }}
                                value={formData.due_date} onChange={(e) => setFormData(p => ({ ...p, due_date: e.target.value }))} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>עדיפות</InputLabel>
                                <Select value={formData.priority} label="עדיפות"
                                    onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))}>
                                    <MenuItem value="low">נמוכה</MenuItem>
                                    <MenuItem value="medium">בינונית</MenuItem>
                                    <MenuItem value="high">גבוהה</MenuItem>
                                    <MenuItem value="critical">קריטית</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="הערות" multiline rows={2} value={formData.notes}
                                onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
                    <Button variant="contained" onClick={handleCreateTask} disabled={!formData.title || !formData.due_date}>
                        צור משימה
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MaintenanceCalendar;
