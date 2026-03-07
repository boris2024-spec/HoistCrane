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
    InputAdornment
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
    Close as CloseIcon
} from '@mui/icons-material';
import { equipmentAPI } from '../../services/api';

const EquipmentList = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [filters, setFilters] = useState({
        equipment_type: [],
        status: [],
        manufacturer: '',
        model: '',
        serial_number: '',
        site_name: '',
        inspector_name: '',
        employer: '',
        department: '',
        workplace_name: '',
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
        { value: 'crane', label: 'מנוף' },
        { value: 'hoist', label: 'מנוף רמה' },
        { value: 'forklift', label: 'מלגזה' },
        { value: 'elevator', label: 'מעלית' },
        { value: 'platform', label: 'במה' },
        { value: 'other', label: 'אחר' },
    ];

    const statusOptions = [
        { value: 'active', label: 'פעיל' },
        { value: 'maintenance', label: 'תחזוקה' },
        { value: 'inactive', label: 'לא פעיל' },
        { value: 'retired', label: 'הוצא משימוש' },
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
            manufacturer: '',
            model: '',
            serial_number: '',
            site_name: '',
            inspector_name: '',
            employer: '',
            department: '',
            workplace_name: '',
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

    const columns = [
        {
            field: 'equipment_number',
            headerName: 'פריט ציוד',
            width: 120,
            pinned: 'left'
        },
        {
            field: 'status',
            headerName: 'סטטוס פריט ציוד',
            width: 140,
            renderCell: (params) => (
                <Chip
                    label={getStatusLabel(params.value)}
                    color={getStatusColor(params.value)}
                    size="small"
                />
            )
        },
        {
            field: 'inspection_status',
            headerName: 'סטטוס בדיקות',
            width: 130,
            valueGetter: (params) => params.row.next_inspection_date,
            renderCell: (params) => {
                const nextInspectionDate = params.row.next_inspection_date;
                if (!nextInspectionDate) return '-';
                const nextDate = new Date(nextInspectionDate);
                const today = new Date();
                const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

                let color = 'success';
                let label = 'תקין';
                if (daysDiff < 0) {
                    color = 'error';
                    label = 'לא תקין';
                } else if (daysDiff < 30) {
                    color = 'warning';
                    label = 'מתקרב';
                }
                return <Chip label={label} color={color} size="small" />;
            }
        },
        {
            field: 'serial_number',
            headerName: 'מספר סידורי',
            width: 130
        },
        {
            field: 'employer',
            headerName: 'מעביד',
            width: 150
        },
        {
            field: 'model',
            headerName: 'דגם',
            width: 130
        },
        {
            field: 'description',
            headerName: 'תאור',
            minWidth: 155,
            flex: 1,
            valueFormatter: (params) => params.value ? `${params.value}` : '-'
        },
        {
            field: 'capacity',
            headerName: 'קיבולת',
            width: 100,
            valueFormatter: (params) => params.value ? `${params.value}` : '-'
        },
        {
            field: 'manufacture_date',
            headerName: 'תאריך ייצור',
            width: 130,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-'
        },
        {
            field: 'site_name',
            headerName: 'מיקום',
            width: 150
        },
        {
            field: 'manufacturer',
            headerName: 'יצרן',
            width: 150
        },
        {
            field: 'equipment_type',
            headerName: 'סוג ציוד',
            width: 130,
            valueFormatter: (params) => getTypeLabel(params.value)
        },
        {
            field: 'workplace_name',
            headerName: 'שם מקום עבודה',
            width: 200
        },
        {
            field: 'inspector_name',
            headerName: 'אחראי/ת',
            width: 150
        },
        {
            field: 'last_inspection_date',
            headerName: 'בדיקה אחרונה',
            width: 130,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-'
        },
        {
            field: 'next_inspection_date',
            headerName: 'בדיקה הבאה',
            width: 130,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-'
        },
        {
            field: 'department',
            headerName: 'מחלקה',
            width: 150
        },
        {
            field: 'height',
            headerName: 'גובה',
            width: 100,
            valueFormatter: (params) => params.value ? `${params.value}m` : '-'
        },
        {
            field: 'installation_date',
            headerName: 'תאריך התקנה',
            width: 130,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('he-IL') : '-'
        },
        {
            field: 'actions',
            headerName: 'פעולות',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <Tooltip title="מחק">
                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOne(params.id);
                        }}
                    >
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">עמודות - ציוד</Typography>
                <Box display="flex" gap={2}>
                    <TextField
                        size="small"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="חיפוש בכל הציוד…"
                        sx={{ minWidth: 260 }}
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
                                <InputLabel>סטטוס פריט ציוד</InputLabel>
                                <Select
                                    multiple
                                    value={filters.equipment_type}
                                    onChange={(e) => handleFilterChange('equipment_type', e.target.value)}
                                    input={<OutlinedInput label="סטטוס פריט ציוד" />}
                                    renderValue={(selected) => selected.map(v => getTypeLabel(v)).join(', ')}
                                >
                                    {equipmentTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            <Checkbox checked={filters.equipment_type.indexOf(type.value) > -1} />
                                            <ListItemText primary={type.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Status Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>סטטוס בדיקות</InputLabel>
                                <Select
                                    multiple
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    input={<OutlinedInput label="סטטוס בדיקות" />}
                                    renderValue={(selected) => selected.map(v => getStatusLabel(v)).join(', ')}
                                >
                                    {statusOptions.map((status) => (
                                        <MenuItem key={status.value} value={status.value}>
                                            <Checkbox checked={filters.status.indexOf(status.value) > -1} />
                                            <ListItemText primary={status.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Manufacturer Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="יצרן"
                                value={filters.manufacturer}
                                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                            />
                        </Grid>

                        {/* Model Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="דגם"
                                value={filters.model}
                                onChange={(e) => handleFilterChange('model', e.target.value)}
                            />
                        </Grid>

                        {/* Serial Number Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="חתום ציוד"
                                value={filters.serial_number}
                                onChange={(e) => handleFilterChange('serial_number', e.target.value)}
                            />
                        </Grid>

                        {/* Site Name Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="מיקום"
                                value={filters.site_name}
                                onChange={(e) => handleFilterChange('site_name', e.target.value)}
                            />
                        </Grid>

                        {/* Inspector Name Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>אחראי/ת</InputLabel>
                                <Select
                                    value={filters.inspector_name}
                                    label="אחראי/ת"
                                    onChange={(e) => handleFilterChange('inspector_name', e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>הכל</em>
                                    </MenuItem>
                                    {inspectorOptions.map((name) => (
                                        <MenuItem key={name} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Employer Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="חברה"
                                value={filters.employer}
                                onChange={(e) => handleFilterChange('employer', e.target.value)}
                            />
                        </Grid>

                        {/* Department Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="מספר סידורי פנימי"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            />
                        </Grid>

                        {/* Workplace Name Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="תחת תתקלקה"
                                value={filters.workplace_name}
                                onChange={(e) => handleFilterChange('workplace_name', e.target.value)}
                            />
                        </Grid>

                        {/* Capacity Range */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="עיד מינ"
                                type="number"
                                value={filters.capacity_min}
                                onChange={(e) => handleFilterChange('capacity_min', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="עיד מקס"
                                type="number"
                                value={filters.capacity_max}
                                onChange={(e) => handleFilterChange('capacity_max', e.target.value)}
                            />
                        </Grid>

                        {/* Height Range */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="גובה מינ"
                                type="number"
                                value={filters.height_min}
                                onChange={(e) => handleFilterChange('height_min', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="גובה מקס"
                                type="number"
                                value={filters.height_max}
                                onChange={(e) => handleFilterChange('height_max', e.target.value)}
                            />
                        </Grid>

                        {/* Manufacture Year Range */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="שנת ייצור מ-"
                                type="number"
                                value={filters.manufacture_year_min}
                                onChange={(e) => handleFilterChange('manufacture_year_min', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="שנת ייצור עד"
                                type="number"
                                value={filters.manufacture_year_max}
                                onChange={(e) => handleFilterChange('manufacture_year_max', e.target.value)}
                            />
                        </Grid>

                        {/* Last Inspection Date Range */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="בדיקה אחרונה מ-"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.last_inspection_date_from}
                                onChange={(e) => handleFilterChange('last_inspection_date_from', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="בדיקה אחרונה עד"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.last_inspection_date_to}
                                onChange={(e) => handleFilterChange('last_inspection_date_to', e.target.value)}
                            />
                        </Grid>

                        {/* Next Inspection Date Range */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="בדיקה הבאה מ-"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.next_inspection_date_from}
                                onChange={(e) => handleFilterChange('next_inspection_date_from', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="בדיקה הבאה עד"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.next_inspection_date_to}
                                onChange={(e) => handleFilterChange('next_inspection_date_to', e.target.value)}
                            />
                        </Grid>

                        {/* Clear Filters Button */}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                onClick={handleClearFilters}
                                fullWidth
                            >
                                נקה כל הפילטרים
                            </Button>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} px={1}>
                <Typography variant="body2" color="text.secondary">
                    {loading ? 'טוען תוצאות…' : `פריטים שנמצאו: ${Number(totalCount || 0).toLocaleString()}`}
                </Typography>
            </Box>

            <Paper>
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
                            // Quick filter is client-side only; we use server-side search above
                            showQuickFilter: false,
                        },
                    }}
                    sx={{
                        cursor: 'pointer',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderRadius: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1
                        },
                        '& .MuiDataGrid-cell': {
                            fontSize: '13px'
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: '16px',
                            gap: '8px',
                            '& .MuiButton-root': {
                                fontSize: '13px'
                            }
                        }
                    }}
                    localeText={{
                        toolbarQuickFilterPlaceholder: 'חיפוש…',
                    }}
                />
            </Paper>
        </Box>
    );
};

export default EquipmentList;
