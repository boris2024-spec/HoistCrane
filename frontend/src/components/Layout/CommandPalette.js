import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Dialog, DialogContent, InputBase, List, ListItem, ListItemIcon,
    ListItemText, Box, Typography, Chip, Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon, Build as BuildIcon, Description as DocumentIcon,
    Assignment as InspectionIcon, Report as ReportIcon, Search as SearchIcon,
    Add as AddIcon, Upload as UploadIcon, CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const commands = [
    { id: 'dashboard', label: 'לוח בקרה', icon: <DashboardIcon />, path: '/', group: 'ניווט' },
    { id: 'equipment', label: 'רשימת ציוד', icon: <BuildIcon />, path: '/equipment', group: 'ניווט' },
    { id: 'inspections', label: 'בדיקות', icon: <InspectionIcon />, path: '/inspections', group: 'ניווט' },
    { id: 'documents', label: 'מסמכים', icon: <DocumentIcon />, path: '/documents', group: 'ניווט' },
    { id: 'issues', label: 'תקלות', icon: <ReportIcon />, path: '/issues', group: 'ניווט' },
    { id: 'maintenance', label: 'תחזוקה', icon: <CalendarIcon />, path: '/maintenance', group: 'ניווט' },
    { id: 'new-equipment', label: 'הוסף ציוד חדש', icon: <AddIcon />, path: '/equipment/new', group: 'פעולות' },
    { id: 'import', label: 'ייבוא ציוד', icon: <UploadIcon />, path: '/equipment/import', group: 'פעולות' },
    { id: 'new-report', label: 'דוח בדיקה חדש', icon: <InspectionIcon />, path: '/inspections/report/new', group: 'פעולות' },
];

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const filtered = commands.filter((cmd) =>
        cmd.label.includes(query) || cmd.id.includes(query.toLowerCase())
    );

    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setOpen(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [open]);

    const handleSelect = (cmd) => {
        navigate(cmd.path);
        setOpen(false);
    };

    const handleDialogKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const groups = {};
    filtered.forEach((cmd) => {
        if (!groups[cmd.group]) groups[cmd.group] = [];
        groups[cmd.group].push(cmd);
    });

    let flatIndex = 0;

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            onKeyDown={handleDialogKeyDown}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    position: 'fixed', top: '20%', borderRadius: 3,
                    maxHeight: 420, overflow: 'hidden',
                },
            }}
            BackdropProps={{ sx: { backdropFilter: 'blur(4px)' } }}
        >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <SearchIcon sx={{ color: 'text.secondary' }} />
                <InputBase
                    ref={inputRef}
                    autoFocus
                    fullWidth
                    placeholder="חפש פקודה או עמוד..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                    sx={{ fontSize: '1rem' }}
                />
                <Chip label="Ctrl+K" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
            </Box>
            <DialogContent sx={{ p: 0, overflow: 'auto' }}>
                {filtered.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">לא נמצאו תוצאות</Typography>
                    </Box>
                ) : (
                    <List dense disablePadding>
                        {Object.entries(groups).map(([group, items], gIdx) => (
                            <React.Fragment key={group}>
                                {gIdx > 0 && <Divider />}
                                <Typography variant="overline" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                                    {group}
                                </Typography>
                                {items.map((cmd) => {
                                    const idx = flatIndex++;
                                    return (
                                        <ListItem
                                            key={cmd.id}
                                            onClick={() => handleSelect(cmd)}
                                            selected={idx === selectedIndex}
                                            sx={{
                                                cursor: 'pointer', py: 1, px: 2,
                                                '&.Mui-selected': { bgcolor: 'action.selected' },
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                                                {cmd.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={cmd.label}
                                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;
