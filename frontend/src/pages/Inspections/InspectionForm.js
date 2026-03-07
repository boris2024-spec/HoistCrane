import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid,
    FormControl, InputLabel, Select, MenuItem,
    RadioGroup, FormControlLabel, Radio, FormLabel,
    Autocomplete
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { equipmentAPI } from '../../services/api';
import axios from 'axios';

const InspectionForm = ({ equipmentId, onSave, onCancel, inspection }) => {
    const [formData, setFormData] = useState({
        equipment: equipmentId || '',
        inspection_type: '',
        inspection_date: new Date(),
        next_due_date: null,
        inspector_name: '',
        inspector_license: '',
        result: 'pass',
        notes: '',
        // Additional fields from the form
        workplace_name: '',
        employer: '',
        site: '',
        fab: '',
        location: '',
        cost: '',
        mileage: '',
        units: '',
        working_hours: '',
        inspection_notes: ''
    });

    const [equipmentList, setEquipmentList] = useState([]);
    const [equipmentSearch, setEquipmentSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (inspection) {
            setFormData({
                ...inspection,
                inspection_date: new Date(inspection.inspection_date),
                next_due_date: inspection.next_due_date ? new Date(inspection.next_due_date) : null,
            });
        }
    }, [inspection]);

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.list({ page_size: 1000 });
            setEquipmentList(response.data.results || []);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    if (key === 'inspection_date' && formData[key]) {
                        formDataToSend.append(key, formData[key].toISOString().split('T')[0]);
                    } else if (key === 'next_due_date' && formData[key]) {
                        formDataToSend.append(key, formData[key].toISOString().split('T')[0]);
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            });

            // Add file if selected
            if (selectedFile) {
                formDataToSend.append('attachment', selectedFile);
            }

            if (inspection) {
                await axios.put(`/api/inspections/${inspection.id}/`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post('/api/inspections/', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            if (onSave) {
                onSave();
            }
        } catch (error) {
            console.error('Error saving inspection:', error);
            alert('שגיאה בשמירת הבדיקה');
        }
    };

    const inspectionTypes = [
        { value: 'annual', label: 'בדיקה שנתית' },
        { value: 'periodic', label: 'בדיקה תקופתית' },
        { value: 'post_repair', label: 'בדיקה אחרי תיקון' },
        { value: 'pre_operation', label: 'בדיקה לפני הפעלה' }
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {inspection ? 'עריכת בדיקה' : 'הוספת בדיקה חדשה'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        {/* טופס - Equipment Selection */}
                        {!equipmentId && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={equipmentList}
                                    getOptionLabel={(option) => `${option.equipment_number} - ${option.description || ''}`}
                                    value={equipmentList.find(e => e.id === formData.equipment) || null}
                                    onChange={(event, newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            equipment: newValue?.id || ''
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="טופס *"
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                        {/* פרטי חברת/אחר - Inspector Details */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="פרטי חברת/אחר בודקת *"
                                name="inspector_name"
                                value={formData.inspector_name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="מספר ר.ח"
                                name="inspector_license"
                                value={formData.inspector_license}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* מיקום */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="מיקום"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* תאריך בדיקה */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="תאריך בדיקה *"
                                value={formData.inspection_date}
                                onChange={(newValue) => handleDateChange('inspection_date', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </Grid>

                        {/* פגיעה תוקף בדיקה */}
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="פגיעה תוקף בדיקה"
                                value={formData.next_due_date}
                                onChange={(newValue) => handleDateChange('next_due_date', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
                            />
                        </Grid>

                        {/* תאריך ר.ח */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="תאריך ר.ח"
                                name="site"
                                value={formData.site}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* העיר / נהג / נוהל */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="העיר / נהג / נוהל"
                                name="workplace_name"
                                value={formData.workplace_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* עלות */}
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="עלות"
                                name="cost"
                                type="number"
                                value={formData.cost}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* מד מרחק */}
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="מד מרחק"
                                name="mileage"
                                type="number"
                                value={formData.mileage}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* יחידות */}
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="יחידות"
                                name="units"
                                value={formData.units}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* שעות עבודה */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="שעות עבודה"
                                name="working_hours"
                                type="number"
                                value={formData.working_hours}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* הערה */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="הערה"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* סטטוס בדיקה */}
                        <Grid item xs={12}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">סטטוס *</FormLabel>
                                <RadioGroup
                                    name="result"
                                    value={formData.result}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel
                                        value="pass"
                                        control={<Radio />}
                                        label="בדיקה תקינה ללא הערות"
                                    />
                                    <FormControlLabel
                                        value="conditional"
                                        control={<Radio />}
                                        label="בדיקה תקינה עם הערות"
                                    />
                                    <FormControlLabel
                                        value="fail"
                                        control={<Radio />}
                                        label="בדיקה נכשלה"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {/* דרישה - סוג בדיקה */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="דרישה - סוג בדיקה *"
                                name="inspection_type"
                                value={formData.inspection_type}
                                onChange={handleChange}
                                required
                            >
                                {inspectionTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* העלאת תמונה/קובץ */}
                        <Grid item xs={12}>
                            <Box>
                                <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                                    צירוף תמונה או קובץ
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                                >
                                    {selectedFile ? selectedFile.name : 'בחר קובץ'}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf,.doc,.docx"
                                    />
                                </Button>
                                {inspection?.attachment && !selectedFile && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        קובץ קיים: {inspection.attachment.split('/').pop()}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Buttons */}
                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={onCancel}
                                >
                                    ביטול
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    שמירה
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};

export default InspectionForm;
