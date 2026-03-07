import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid, MenuItem, Divider, useMediaQuery, useTheme } from '@mui/material';
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
        equipment_type: 'lifting_accessories',
        super_domain: '',
        status: 'active',
        inspection_status: 'none',
        internal_serial_number: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        manufacture_year: '',
        manufacture_date: '',
        license_number: '',
        warranty_expiry: '',
        capacity: '',
        capacity_unit: 'kg',
        height: '',
        working_pressure: '',
        safe_working_load: '',
        max_allowed_pressure: '',
        measurement_unit: '',
        measurement_resolution: '',
        measurement_range: '',
        employer: '',
        service_company: '',
        wing: '',
        division: '',
        department: '',
        sub_department: '',
        unit: '',
        country: '',
        district: '',
        city: '',
        site_name: '',
        yam_number: '',
        site_status: '',
        campus: '',
        address: '',
        building: '',
        floor_number: '',
        room: '',
        workplace_name: '',
        location_details: '',
        production_line: '',
        project: '',
        description: '',
        notes: '',
        tag: '',
        inspector_name: '',
        periodic_inspections: '',
        equipment_set: '',
        certified_workers: '',
        url: '',
    });

    useEffect(() => {
        if (isEdit) { fetchEquipment(); }
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
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) { await equipmentAPI.update(id, formData); }
            else { await equipmentAPI.create(formData); }
            navigate('/equipment');
        } catch (error) {
            console.error('Error saving equipment:', error);
            alert('שגיאה בשמירת הציוד');
        } finally {
            setLoading(false);
        }
    };

    const SectionTitle = ({ children }) => (
        <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>{children}</Typography>
        </Grid>
    );

    return (
        <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
                {isEdit ? 'עריכת ציוד' : 'הוספת ציוד חדש'}
            </Typography>

            <Paper sx={{ p: isMobile ? 2 : 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* ── זיהוי ראשי ── */}
                        <SectionTitle>זיהוי ראשי</SectionTitle>
                        <Grid item xs={12} md={6}><TextField fullWidth required label="פריט ציוד" name="equipment_number" value={formData.equipment_number} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth required select label="תחום ציוד" name="equipment_type" value={formData.equipment_type} onChange={handleChange}>
                                <MenuItem value="lifting_accessories">אביזרי הרמה</MenuItem>
                                <MenuItem value="no_inspection_required">לא חייב בבדיקה</MenuItem>
                                <MenuItem value="forklifts">מלגזות</MenuItem>
                                <MenuItem value="lifting_facilities">מתקני הרמה</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="תחום על" name="super_domain" value={formData.super_domain || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="סטטוס פריט ציוד" name="status" value={formData.status} onChange={handleChange}>
                                <MenuItem value="active">פעיל</MenuItem>
                                <MenuItem value="maintenance">בתחזוקה</MenuItem>
                                <MenuItem value="inactive">לא פעיל</MenuItem>
                                <MenuItem value="retired">הוצא משימוש</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="סטטוס בדיקות" name="inspection_status" value={formData.inspection_status || 'none'} onChange={handleChange}>
                                <MenuItem value="valid">תקין</MenuItem>
                                <MenuItem value="approaching">מתקרב</MenuItem>
                                <MenuItem value="expired">לא תקין</MenuItem>
                                <MenuItem value="none">ללא בדיקה</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מספר סידורי פנימי" name="internal_serial_number" value={formData.internal_serial_number || ''} onChange={handleChange} /></Grid>

                        {/* ── פרטי יצרן ── */}
                        <SectionTitle>פרטי יצרן</SectionTitle>
                        <Grid item xs={12} md={6}><TextField fullWidth label="יצרן" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="דגם" name="model" value={formData.model || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מספר סידורי יצרן" name="serial_number" value={formData.serial_number || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="שנת ייצור" name="manufacture_year" value={formData.manufacture_year || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="date" label="תאריך ייצור" name="manufacture_date" value={formData.manufacture_date || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מספר רישיון / רישוי" name="license_number" value={formData.license_number || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="date" label="פקיעת תוקף אחריות" name="warranty_expiry" value={formData.warranty_expiry || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>

                        {/* ── מפרט טכני ── */}
                        <SectionTitle>מפרט טכני</SectionTitle>
                        <Grid item xs={12} md={6}><TextField fullWidth label="עומס עבודה בטוח" name="safe_working_load" value={formData.safe_working_load || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="לחץ מירבי מותר" name="max_allowed_pressure" value={formData.max_allowed_pressure || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="יחידת מדידה" name="measurement_unit" value={formData.measurement_unit || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="רזולוציית מדידה" name="measurement_resolution" value={formData.measurement_resolution || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="טווח מדידה" name="measurement_range" value={formData.measurement_range || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="קיבולת" name="capacity" value={formData.capacity || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="גובה (מ')" name="height" value={formData.height || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="לחץ עבודה" name="working_pressure" value={formData.working_pressure || ''} onChange={handleChange} /></Grid>

                        {/* ── היררכיה ארגונית ── */}
                        <SectionTitle>היררכיה ארגונית</SectionTitle>
                        <Grid item xs={12} md={6}><TextField fullWidth label="חברה" name="employer" value={formData.employer || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="חברת שירות / קבלן" name="service_company" value={formData.service_company || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="אגף" name="wing" value={formData.wing || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="חטיבה" name="division" value={formData.division || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מחלקה" name="department" value={formData.department || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="תת מחלקה" name="sub_department" value={formData.sub_department || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="יחידה" name="unit" value={formData.unit || ''} onChange={handleChange} /></Grid>

                        {/* ── מיקום ── */}
                        <SectionTitle>מיקום</SectionTitle>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מדינה" name="country" value={formData.country || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מחוז / איזור" name="district" value={formData.district || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="עיר / יישוב" name="city" value={formData.city || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="אתר / סניף" name="site_name" value={formData.site_name || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מספר יא״מ" name="yam_number" value={formData.yam_number || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="סטטוס אתר / סניף" name="site_status" value={formData.site_status || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="קמפוס" name="campus" value={formData.campus || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="כתובת" name="address" value={formData.address || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מבנה / מתקן" name="building" value={formData.building || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="קומה" name="floor_number" value={formData.floor_number || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="חדר" name="room" value={formData.room || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="מיקום" name="location_details" value={formData.location_details || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="קו ייצור" name="production_line" value={formData.production_line || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="פרויקט" name="project" value={formData.project || ''} onChange={handleChange} /></Grid>

                        {/* ── מידע נוסף ── */}
                        <SectionTitle>מידע נוסף</SectionTitle>
                        <Grid item xs={12}><TextField fullWidth multiline rows={3} label="תאור" name="description" value={formData.description || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField fullWidth multiline rows={2} label="הערה" name="notes" value={formData.notes || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="תגית" name="tag" value={formData.tag || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="אחראי/ת" name="inspector_name" value={formData.inspector_name || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="בדיקות תקופתיות" name="periodic_inspections" value={formData.periodic_inspections || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="ערכת ציוד" name="equipment_set" value={formData.equipment_set || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField fullWidth multiline rows={2} label="עובדים מוסמכים" name="certified_workers" value={formData.certified_workers || ''} onChange={handleChange} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="URL" name="url" value={formData.url || ''} onChange={handleChange} /></Grid>

                        {/* ── כפתורים ── */}
                        <Grid item xs={12}>
                            <Box display="flex" gap={2} justifyContent={isMobile ? 'stretch' : 'flex-end'} flexDirection={isMobile ? 'column-reverse' : 'row'}>
                                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate('/equipment')} fullWidth={isMobile}>ביטול</Button>
                                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading} fullWidth={isMobile}>{loading ? 'שומר...' : 'שמור'}</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default EquipmentForm;
