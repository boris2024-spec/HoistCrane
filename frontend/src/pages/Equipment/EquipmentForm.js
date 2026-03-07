import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { equipmentAPI } from '../../services/api';

const EquipmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        equipment_number: '',
        equipment_type: 'crane',
        manufacturer: '',
        model: '',
        serial_number: '',
        manufacture_year: '',
        capacity: '',
        capacity_unit: 'kg',
        height: '',
        site_name: '',
        workplace_name: '',
        employer: '',
        status: 'active',
        description: '',
        notes: '',
        inspector_name: '',
    });

    useEffect(() => {
        if (isEdit) {
            fetchEquipment();
        }
    }, [id]);

    const fetchEquipment = async () => {
        try {
            const response = await equipmentAPI.get(id);
            setFormData(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await equipmentAPI.update(id, formData);
            } else {
                await equipmentAPI.create(formData);
            }
            navigate('/equipment');
        } catch (error) {
            console.error('Error saving equipment:', error);
            alert('שגיאה בשמירת הציוד');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
                {isEdit ? 'עריכת ציוד' : 'הוספת ציוד חדש'}
            </Typography>

            <Paper sx={{ p: isMobile ? 2 : 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="מספר ציוד"
                                name="equipment_number"
                                value={formData.equipment_number}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="סוג ציוד"
                                name="equipment_type"
                                value={formData.equipment_type}
                                onChange={handleChange}
                            >
                                <MenuItem value="crane">מנוף</MenuItem>
                                <MenuItem value="hoist">מנוף רמה</MenuItem>
                                <MenuItem value="forklift">מלגזה</MenuItem>
                                <MenuItem value="elevator">מעלית</MenuItem>
                                <MenuItem value="platform">במה</MenuItem>
                                <MenuItem value="other">אחר</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="יצרן"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="דגם"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="מספר סידורי"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="שנת ייצור"
                                name="manufacture_year"
                                value={formData.manufacture_year}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="קיבולת"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="גובה (מ')"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="אתר"
                                name="site_name"
                                value={formData.site_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="מקום עבודה"
                                name="workplace_name"
                                value={formData.workplace_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="מעביד"
                                name="employer"
                                value={formData.employer}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="סטטוס"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="active">פעיל</MenuItem>
                                <MenuItem value="maintenance">בתחזוקה</MenuItem>
                                <MenuItem value="inactive">לא פעיל</MenuItem>
                                <MenuItem value="retired">הוצא משימוש</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="תאור"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="הערות"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="מחלקה"
                                name="department"
                                value={formData.department || ''}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="שם הבודק"
                                name="inspector_name"
                                value={formData.inspector_name}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent={isMobile ? 'stretch' : 'flex-end'} flexDirection={isMobile ? 'column-reverse' : 'row'}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={() => navigate('/equipment')}
                                    fullWidth={isMobile}
                                >
                                    ביטול
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                    fullWidth={isMobile}
                                >
                                    {loading ? 'שומר...' : 'שמור'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default EquipmentForm;
