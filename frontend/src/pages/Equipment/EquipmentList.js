import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    TextField,
    MenuItem,
    Chip,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    IconButton,
    Tooltip,
    InputAdornment,
    Card,
    CardContent,
    CardActionArea,
    Stack,
    Menu,
    Divider,
    useMediaQuery,
    useTheme,
    Skeleton
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Upload as UploadIcon,
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
    FileDownload as FileDownloadIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    MoreVert as MoreVertIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { equipmentAPI } from '../../services/api';

const EquipmentList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));   // < 600px
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));   // < 900px
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 100,
    });
    const [searchInput, setSearchInput] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [inspectorOptions, setInspectorOptions] = useState([]);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const [filters, setFilters] = useState({
        equipment_type: [],
        status: [],
        inspection_status: [],
        manufacturer: '',
        model: '',
        serial_number: '',
        internal_serial_number: '',
        site_name: '',
        inspector_name: '',
        employer: '',
        service_company: '',
        department: '',
        sub_department: '',
        division: '',
        wing: '',
        unit: '',
        workplace_name: '',
        country: '',
        district: '',
        city: '',
        campus: '',
        building: '',
        project: '',
        tag: '',
        super_domain: '',
        capacity_min: '',
        capacity_max: '',
        height_min: '',
        height_max: '',
        manufacture_year_min: '',
        manufacture_year_max: '',
        last_inspection_date_from: '',
        last_inspection_date_to: '',
        next_inspection_date_from: '',
        next_inspection_date_to: '',
    });

    const equipmentTypes = [
        { value: 'lifting_accessories', label: 'אביזרי הרמה' },
        { value: 'no_inspection_required', label: 'לא חייב בבדיקה' },
        { value: 'forklifts', label: 'מלגזות' },
        { value: 'lifting_facilities', label: 'מתקני הרמה' },
    ];

    const statusOptions = [
        { value: 'active', label: 'פעיל' },
        { value: 'maintenance', label: 'תחזוקה' },
        { value: 'inactive', label: 'לא פעיל' },
        { value: 'retired', label: 'הוצא משימוש' },
    ];

    const inspectionStatusOptions = [
        { value: 'valid', label: 'תקין' },
        { value: 'approaching', label: 'מתקרב' },
        { value: 'expired', label: 'לא תקין' },
        { value: 'none', label: 'ללא בדיקה' },
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search') || '';
        setSearchInput(search);
        fetchEquipment(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, paginationModel.page, paginationModel.pageSize, filters]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await equipmentAPI.options();
                const names = response?.data?.inspector_names;
                setInspectorOptions(Array.isArray(names) ? names : []);
            } catch (error) {
                console.error('Error fetching equipment options:', error);
                setInspectorOptions([]);
            }
        };

        fetchOptions();
    }, []);

    // Keep URL `search` param in sync (server-side search across ALL pages)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const urlSearch = urlParams.get('search') || '';

        // Avoid navigation loops
        if ((searchInput || '') === urlSearch) return;

        const handle = setTimeout(() => {
            const nextParams = new URLSearchParams(location.search);
            const nextValue = (searchInput || '').trim();
            if (nextValue) {
                nextParams.set('search', nextValue);
            } else {
                nextParams.delete('search');
            }

            // Reset to first page when search changes
            setPaginationModel(prev => ({ ...prev, page: 0 }));

            const nextSearch = nextParams.toString();
            const nextLocationSearch = nextSearch ? `?${nextSearch}` : '';
            navigate({ pathname: location.pathname, search: nextLocationSearch }, { replace: true });
        }, 400);

        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const fetchEquipment = async (search = '') => {
        setLoading(true);
        try {
            const params = {
                page: paginationModel.page + 1,
                page_size: paginationModel.pageSize
            };
            if (search) {
                params.search = search;
            }
            // Add all active filters
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    if (Array.isArray(filters[key]) && filters[key].length > 0) {
                        params[key] = filters[key].join(',');
                    } else if (!Array.isArray(filters[key]) && filters[key] !== '') {
                        params[key] = filters[key];
                    }
                }
            });
            console.log('Fetching equipment with params:', params);
            const response = await equipmentAPI.list(params);
            console.log('API response:', response.data);
            setEquipment(response.data.results || response.data);
            setTotalCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            equipment_type: [],
            status: [],
            inspection_status: [],
            manufacturer: '',
            model: '',
            serial_number: '',
            internal_serial_number: '',
            site_name: '',
            inspector_name: '',
            employer: '',
            service_company: '',
            department: '',
            sub_department: '',
            division: '',
            wing: '',
            unit: '',
            workplace_name: '',
            country: '',
            district: '',
            city: '',
            campus: '',
            building: '',
            project: '',
            tag: '',
            super_domain: '',
            capacity_min: '',
            capacity_max: '',
            height_min: '',
            height_max: '',
            manufacture_year_min: '',
            manufacture_year_max: '',
            last_inspection_date_from: '',
            last_inspection_date_to: '',
            next_inspection_date_from: '',
            next_inspection_date_to: '',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'maintenance':
                return 'warning';
            case 'inactive':
                return 'default';
            case 'retired':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        const option = statusOptions.find(s => s.value === status);
        return option ? option.label : status;
    };

    const getTypeLabel = (type) => {
        const option = equipmentTypes.find(t => t.value === type);
        return option ? option.label : type;
    };

    const handleDeleteOne = async (id) => {
        const confirmed = window.confirm('למחוק את פריט הציוד?');
        if (!confirmed) return;

        try {
            await equipmentAPI.delete(id);
            handleRefresh();
        } catch (error) {
            console.error('Error deleting equipment:', error);
            alert('שגיאה במחיקה');
        }
    };

    const handleDeleteSelected = async () => {
        if (!rowSelectionModel || rowSelectionModel.length === 0) return;

        const confirmed = window.confirm(`למחוק ${rowSelectionModel.length} פריטים?`);
        if (!confirmed) return;

        try {
            await equipmentAPI.bulkDelete(rowSelectionModel);
            setRowSelectionModel([]);
            handleRefresh();
        } catch (error) {
            console.error('Error bulk deleting equipment:', error);
            alert('שגיאה במחיקה מרובה');
        }
    };

    const getInspectionStatusLabel = (val) => {
        const opt = inspectionStatusOptions.find(o => o.value === val);
        return opt ? opt.label : val || '-';
    };

    const columns = [
        { field: 'equipment_number', headerName: 'פריט ציוד', width: 130, pinned: 'left' },
        { field: 'equipment_type', headerName: 'תחום ציוד', width: 130, valueFormatter: (params) => getTypeLabel(params.value) },
        { field: 'super_domain', headerName: 'תחום על', width: 130 },
        {
            field: 'status', headerName: 'סטטוס פריט ציוד', width: 140,
            renderCell: (params) => (
                <Chip label={getStatusLabel(params.value)} color={getStatusColor(params.value)} size="small" />
            )
        },
        {
            field: 'inspection_status', headerName: 'סטטוס בדיקות', width: 130,
            renderCell: (params) => {
                const val = params.value;
                if (!val || val === 'none') {
                    const nextInspectionDate = params.row.next_inspection_date;
                    if (!nextInspectionDate) return '-';
                    const nextDate = new Date(nextInspectionDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                    let color = 'success', label = 'תקין';
                    if (daysDiff < 0) { color = 'error'; label = 'לא תקין'; }
                    else if (daysDiff < 30) { color = 'warning'; label = 'מתקרב'; }
                    return <Chip label={label} color={color} size="small" />;
                }
                const colorMap = { valid: 'success', approaching: 'warning', expired: 'error' };
                return <Chip label={getInspectionStatusLabel(val)} color={colorMap[val] || 'default'} size="small" />;
            }
        },
        { field: 'internal_serial_number', headerName: 'מספר סידורי פנימי', width: 150 },
        { field: 'employer', headerName: 'חברה', width: 150 },
        { field: 'service_company', headerName: 'חברת שירות / קבלן', width: 160 },
        { field: 'wing', headerName: 'אגף', width: 120 },
        { field: 'division', headerName: 'חטיבה', width: 120 },
        { field: 'department', headerName: 'מחלקה', width: 130 },
        { field: 'sub_department', headerName: 'תת מחלקה', width: 130 },
        { field: 'unit', headerName: 'יחידה', width: 120 },
        { field: 'country', headerName: 'מדינה', width: 120 },
        { field: 'district', headerName: 'מחוז / איזור', width: 130 },
        { field: 'city', headerName: 'עיר / יישוב', width: 130 },
        { field: 'site_name', headerName: 'אתר / סניף', width: 150 },
        { field: 'yam_number', headerName: 'מספר יא״מ', width: 120 },
        { field: 'site_status', headerName: 'סטטוס אתר / סניף', width: 150 },
        { field: 'campus', headerName: 'קמפוס', width: 120 },
        { field: 'address', headerName: 'כתובת', width: 180 },
        { field: 'building', headerName: 'מבנה / מתקן', width: 130 },
        { field: 'floor_number', headerName: 'קומה', width: 100 },
        { field: 'room', headerName: 'חדר', width: 100 },
        { field: 'location_details', headerName: 'מיקום', width: 150 },
        { field: 'production_line', headerName: 'קו ייצור', width: 130 },
        { field: 'project', headerName: 'פרויקט', width: 130 },
        { field: 'license_number', headerName: 'מספר רישיון / רישוי', width: 160 },
        { field: 'manufacturer', headerName: 'יצרן', width: 150 },
        { field: 'manufacture_date', headerName: 'תאריך ייצור', width: 130, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-' },
        { field: 'serial_number', headerName: 'מספר סידורי יצרן', width: 150 },
        { field: 'warranty_expiry', headerName: 'פקיעת תוקף אחריות', width: 160, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-' },
        { field: 'model', headerName: 'דגם', width: 130 },
        { field: 'description', headerName: 'תאור', minWidth: 155, flex: 1, valueFormatter: (params) => params.value ? `${params.value}` : '-' },
        { field: 'notes', headerName: 'הערה', width: 150 },
        { field: 'tag', headerName: 'תגית', width: 120 },
        { field: 'inspector_name', headerName: 'אחראי/ת', width: 150 },
        { field: 'periodic_inspections', headerName: 'בדיקות תקופתיות', width: 160 },
        { field: 'file_count', headerName: 'מספר קבצים', width: 120 },
        { field: 'equipment_set', headerName: 'ערכת ציוד', width: 130 },
        { field: 'certified_workers', headerName: 'עובדים מוסמכים', width: 150 },
        { field: 'safe_working_load', headerName: 'עומס עבודה בטוח', width: 150 },
        { field: 'max_allowed_pressure', headerName: 'לחץ מירבי מותר', width: 140 },
        { field: 'measurement_unit', headerName: 'יחידת מדידה', width: 130 },
        { field: 'measurement_resolution', headerName: 'רזולוציית מדידה', width: 140 },
        { field: 'measurement_range', headerName: 'טווח מדידה', width: 130 },
        {
            field: 'image', headerName: 'תמונה', width: 100,
            renderCell: (params) => params.value ? <img src={params.value} alt="" style={{ height: 32, borderRadius: 4 }} /> : '-'
        },
        { field: 'url', headerName: 'URL', width: 140, renderCell: (params) => params.value ? <a href={params.value} target="_blank" rel="noopener noreferrer">קישור</a> : '-' },
        { field: 'guid', headerName: 'GUID', width: 270 },
        { field: 'last_inspection_date', headerName: 'בדיקה אחרונה', width: 130, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-' },
        { field: 'next_inspection_date', headerName: 'בדיקה הבאה', width: 130, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-' },
        {
            field: 'actions', headerName: 'פעולות', width: 90, sortable: false, filterable: false, disableColumnMenu: true,
            renderCell: (params) => (
                <Tooltip title="מחק">
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteOne(params.id); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        },
    ];

    const handleRowClick = (params, event) => {
        if (event?.target?.closest?.('.MuiDataGrid-cellCheckbox')) return;
        if (event?.target?.closest?.('button')) return;
        navigate(`/equipment/${params.id}`);
    };

    const handleExportCSV = async () => {
        try {
            // Build params with current filters
            const params = {};
            const currentSearch = new URLSearchParams(location.search).get('search') || '';
            if (currentSearch) params.search = currentSearch;
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    if (Array.isArray(filters[key]) && filters[key].length > 0) {
                        params[key] = filters[key].join(',');
                    } else if (!Array.isArray(filters[key]) && filters[key] !== '') {
                        params[key] = filters[key];
                    }
                }
            });

            // Call export API
            const response = await equipmentAPI.exportCSV(params);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `equipment_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('שגיאה בייצוא הקובץ');
        }
    };

    const handleExportExcel = async () => {
        try {
            // Build params with current filters
            const params = {};
            const currentSearch = new URLSearchParams(location.search).get('search') || '';
            if (currentSearch) params.search = currentSearch;
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    if (Array.isArray(filters[key]) && filters[key].length > 0) {
                        params[key] = filters[key].join(',');
                    } else if (!Array.isArray(filters[key]) && filters[key] !== '') {
                        params[key] = filters[key];
                    }
                }
            });

            // Call export API
            const response = await equipmentAPI.exportExcel(params);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `equipment_export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('שגיאה בייצוא Excel');
        }
    };

    const handleRefresh = () => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search') || '';
        fetchEquipment(search);
    };

    return (
        <Box>
            {/* ─── HEADER ─── */}
            <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems={isMobile ? 'stretch' : 'center'}
                gap={2}
                mb={3}
            >
                <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>ניהול ציוד</Typography>

                {/* Search bar – always visible */}
                <TextField
                    size="small"
                    fullWidth={isMobile}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="חיפוש בכל הציוד…"
                    sx={{ minWidth: isMobile ? 'unset' : 260, order: isMobile ? 1 : 0 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: searchInput ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchInput('')}
                                    aria-label="clear search"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }}
                />

                {/* Action buttons – desktop */}
                {!isMobile && (
                    <Box display="flex" gap={2} flexShrink={0}>
                        <Tooltip title="רענן">
                            <IconButton onClick={handleRefresh} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={rowSelectionModel.length ? `מחק נבחרים (${rowSelectionModel.length})` : 'מחק נבחרים'}>
                            <span>
                                <IconButton
                                    onClick={handleDeleteSelected}
                                    color="error"
                                    disabled={rowSelectionModel.length === 0}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="ייצא ל-CSV">
                            <IconButton onClick={handleExportCSV} color="primary">
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="ייצא ל-Excel">
                            <IconButton onClick={handleExportExcel} color="secondary">
                                <FileDownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={() => navigate('/equipment/import')}
                        >
                            ייבוא CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/equipment/new')}
                        >
                            הוסף ציוד חדש
                        </Button>
                    </Box>
                )}

                {/* Action buttons – mobile: FAB-style row */}
                {isMobile && (
                    <Box display="flex" gap={1} justifyContent="space-between" alignItems="center" order={2}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/equipment/new')}
                            sx={{ flex: 1 }}
                        >
                            הוסף ציוד
                        </Button>
                        <Box display="flex" gap={0.5}>
                            <Tooltip title="רענן">
                                <IconButton onClick={handleRefresh} color="primary" size="small">
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                size="small"
                                onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={mobileMenuAnchor}
                                open={Boolean(mobileMenuAnchor)}
                                onClose={() => setMobileMenuAnchor(null)}
                            >
                                <MenuItem onClick={() => { handleExportCSV(); setMobileMenuAnchor(null); }}>
                                    <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} /> ייצא ל-CSV
                                </MenuItem>
                                <MenuItem onClick={() => { handleExportExcel(); setMobileMenuAnchor(null); }}>
                                    <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} /> ייצא ל-Excel
                                </MenuItem>
                                <MenuItem onClick={() => { navigate('/equipment/import'); setMobileMenuAnchor(null); }}>
                                    <UploadIcon fontSize="small" sx={{ mr: 1 }} /> ייבוא CSV
                                </MenuItem>
                                {rowSelectionModel.length > 0 && (
                                    <MenuItem onClick={() => { handleDeleteSelected(); setMobileMenuAnchor(null); }}>
                                        <DeleteIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} /> מחק נבחרים ({rowSelectionModel.length})
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Advanced Filters */}
            <Accordion
                expanded={filterExpanded}
                onChange={() => setFilterExpanded(!filterExpanded)}
                sx={{ mb: 2 }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FilterListIcon />
                        <Typography>סינון</Typography>
                        {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '') && (
                            <Chip
                                label="פילטרים פעילים"
                                size="small"
                                color="primary"
                                sx={{ ml: 2 }}
                            />
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {/* Equipment Type Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>תחום ציוד</InputLabel>
                                <Select multiple value={filters.equipment_type}
                                    onChange={(e) => handleFilterChange('equipment_type', e.target.value)}
                                    input={<OutlinedInput label="תחום ציוד" />}
                                    renderValue={(selected) => selected.map(v => getTypeLabel(v)).join(', ')}>
                                    {equipmentTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            <Checkbox checked={filters.equipment_type.indexOf(type.value) > -1} />
                                            <ListItemText primary={type.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>סטטוס פריט ציוד</InputLabel>
                                <Select multiple value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    input={<OutlinedInput label="סטטוס פריט ציוד" />}
                                    renderValue={(selected) => selected.map(v => getStatusLabel(v)).join(', ')}>
                                    {statusOptions.map((s) => (
                                        <MenuItem key={s.value} value={s.value}>
                                            <Checkbox checked={filters.status.indexOf(s.value) > -1} />
                                            <ListItemText primary={s.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>סטטוס בדיקות</InputLabel>
                                <Select multiple value={filters.inspection_status}
                                    onChange={(e) => handleFilterChange('inspection_status', e.target.value)}
                                    input={<OutlinedInput label="סטטוס בדיקות" />}
                                    renderValue={(selected) => selected.map(v => getInspectionStatusLabel(v)).join(', ')}>
                                    {inspectionStatusOptions.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            <Checkbox checked={filters.inspection_status.indexOf(opt.value) > -1} />
                                            <ListItemText primary={opt.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="תחום על" value={filters.super_domain} onChange={(e) => handleFilterChange('super_domain', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="יצרן" value={filters.manufacturer} onChange={(e) => handleFilterChange('manufacturer', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="דגם" value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מספר סידורי יצרן" value={filters.serial_number} onChange={(e) => handleFilterChange('serial_number', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מספר סידורי פנימי" value={filters.internal_serial_number} onChange={(e) => handleFilterChange('internal_serial_number', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="חברה" value={filters.employer} onChange={(e) => handleFilterChange('employer', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="חברת שירות / קבלן" value={filters.service_company} onChange={(e) => handleFilterChange('service_company', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="אגף" value={filters.wing} onChange={(e) => handleFilterChange('wing', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="חטיבה" value={filters.division} onChange={(e) => handleFilterChange('division', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מחלקה" value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="תת מחלקה" value={filters.sub_department} onChange={(e) => handleFilterChange('sub_department', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="יחידה" value={filters.unit} onChange={(e) => handleFilterChange('unit', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מדינה" value={filters.country} onChange={(e) => handleFilterChange('country', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מחוז / איזור" value={filters.district} onChange={(e) => handleFilterChange('district', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="עיר / יישוב" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="אתר / סניף" value={filters.site_name} onChange={(e) => handleFilterChange('site_name', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="קמפוס" value={filters.campus} onChange={(e) => handleFilterChange('campus', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="מבנה / מתקן" value={filters.building} onChange={(e) => handleFilterChange('building', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="פרויקט" value={filters.project} onChange={(e) => handleFilterChange('project', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="תגית" value={filters.tag} onChange={(e) => handleFilterChange('tag', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>אחראי/ת</InputLabel>
                                <Select value={filters.inspector_name} label="אחראי/ת"
                                    onChange={(e) => handleFilterChange('inspector_name', e.target.value)}>
                                    <MenuItem value=""><em>הכל</em></MenuItem>
                                    {inspectorOptions.map((name) => (<MenuItem key={name} value={name}>{name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="שנת ייצור מ-" type="number" value={filters.manufacture_year_min} onChange={(e) => handleFilterChange('manufacture_year_min', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="שנת ייצור עד" type="number" value={filters.manufacture_year_max} onChange={(e) => handleFilterChange('manufacture_year_max', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="בדיקה אחרונה מ-" type="date" InputLabelProps={{ shrink: true }} value={filters.last_inspection_date_from} onChange={(e) => handleFilterChange('last_inspection_date_from', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="בדיקה אחרונה עד" type="date" InputLabelProps={{ shrink: true }} value={filters.last_inspection_date_to} onChange={(e) => handleFilterChange('last_inspection_date_to', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="בדיקה הבאה מ-" type="date" InputLabelProps={{ shrink: true }} value={filters.next_inspection_date_from} onChange={(e) => handleFilterChange('next_inspection_date_from', e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="בדיקה הבאה עד" type="date" InputLabelProps={{ shrink: true }} value={filters.next_inspection_date_to} onChange={(e) => handleFilterChange('next_inspection_date_to', e.target.value)} /></Grid>
                        <Grid item xs={12}><Button variant="outlined" onClick={handleClearFilters} fullWidth>נקה כל הפילטרים</Button></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} px={1}>
                <Typography variant="body2" color="text.secondary">
                    {loading ? 'טוען תוצאות…' : `פריטים שנמצאו: ${Number(totalCount || 0).toLocaleString()}`}
                </Typography>
            </Box>

            {/* ─── MOBILE: Card list ─── */}
            {isMobile ? (
                <Box>
                    {loading ? (
                        <Stack spacing={1.5}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} variant="rounded" height={120} />
                            ))}
                        </Stack>
                    ) : equipment.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">לא נמצאו פריטי ציוד</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={1.5}>
                            {equipment.map((item) => {
                                const nextDate = item.next_inspection_date ? new Date(item.next_inspection_date) : null;
                                const today = new Date();
                                const daysDiff = nextDate ? Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) : null;
                                let inspColor = 'success', inspLabel = 'תקין';
                                if (daysDiff !== null) {
                                    if (daysDiff < 0) { inspColor = 'error'; inspLabel = 'לא תקין'; }
                                    else if (daysDiff < 30) { inspColor = 'warning'; inspLabel = 'מתקרב'; }
                                }

                                return (
                                    <Card
                                        key={item.id}
                                        variant="outlined"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <CardActionArea onClick={() => navigate(`/equipment/${item.id}`)}>
                                            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                                {/* Row 1: number, chips, arrow */}
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                        <Typography variant="subtitle1" fontWeight={700}>
                                                            {item.equipment_number}
                                                        </Typography>
                                                        <Chip
                                                            label={getStatusLabel(item.status)}
                                                            color={getStatusColor(item.status)}
                                                            size="small"
                                                            sx={{ height: 22, fontSize: '0.7rem' }}
                                                        />
                                                        {nextDate && (
                                                            <Chip
                                                                label={inspLabel}
                                                                color={inspColor}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ height: 22, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <NavigateNextIcon color="action" sx={{ transform: 'scaleX(-1)' }} />
                                                </Box>

                                                {/* Row 2: type + manufacturer/model */}
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {getTypeLabel(item.equipment_type)}
                                                    {item.manufacturer ? ` • ${item.manufacturer}` : ''}
                                                    {item.model ? ` ${item.model}` : ''}
                                                </Typography>

                                                {/* Row 3: details */}
                                                <Box display="flex" gap={2} mt={0.5} flexWrap="wrap">
                                                    {item.serial_number && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            ס״ד: {item.serial_number}
                                                        </Typography>
                                                    )}
                                                    {item.site_name && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            📍 {item.site_name}
                                                        </Typography>
                                                    )}
                                                    {item.employer && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            🏢 {item.employer}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {/* Row 4: dates */}
                                                {(item.last_inspection_date || item.next_inspection_date) && (
                                                    <Box display="flex" gap={2} mt={0.5}>
                                                        {item.last_inspection_date && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                בדיקה אחרונה: {new Date(item.last_inspection_date).toLocaleDateString('he-IL')}
                                                            </Typography>
                                                        )}
                                                        {item.next_inspection_date && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                הבאה: {new Date(item.next_inspection_date).toLocaleDateString('he-IL')}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}

                    {/* Mobile pagination */}
                    {!loading && totalCount > 0 && (
                        <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
                            <Button
                                size="small"
                                disabled={paginationModel.page === 0}
                                onClick={() => setPaginationModel(p => ({ ...p, page: p.page - 1 }))}
                            >
                                הקודם
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                עמוד {paginationModel.page + 1} מתוך {Math.ceil(totalCount / paginationModel.pageSize)}
                            </Typography>
                            <Button
                                size="small"
                                disabled={(paginationModel.page + 1) * paginationModel.pageSize >= totalCount}
                                onClick={() => setPaginationModel(p => ({ ...p, page: p.page + 1 }))}
                            >
                                הבא
                            </Button>
                        </Box>
                    )}
                </Box>
            ) : (
                /* ─── DESKTOP / TABLET: DataGrid ─── */
                <Paper sx={{ overflow: 'hidden', width: '100%' }}>
                    <DataGrid
                        rows={equipment}
                        columns={columns}
                        rowCount={totalCount}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[25, 50, 100]}
                        loading={loading}
                        autoHeight
                        disableRowSelectionOnClick
                        onRowClick={handleRowClick}
                        checkboxSelection
                        rowSelectionModel={rowSelectionModel}
                        onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: false,
                            },
                        }}
                        sx={{
                            cursor: 'pointer',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                borderRadius: 0,
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 700,
                                },
                            },
                            '& .MuiDataGrid-cell': {
                                fontSize: '13px',
                                borderColor: 'divider',
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: 'action.hover',
                            },
                            '& .MuiDataGrid-toolbarContainer': {
                                padding: '12px 16px',
                                gap: '8px',
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiButton-root': { fontSize: '13px' }
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: 1,
                                borderColor: 'divider',
                            },
                        }}
                        localeText={{
                            toolbarQuickFilterPlaceholder: 'חיפוש…',
                        }}
                    />
                </Paper>
            )}
        </Box>
    );
};

export default EquipmentList;
