import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, TextField, Button, Grid, Divider,
    Tab, Tabs, Alert, Chip, LinearProgress, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, FormControl, InputLabel, Card, CardContent,
} from '@mui/material';
import {
    Business as BusinessIcon,
    LocationOn as LocationIcon,
    People as PeopleIcon,
    Mail as MailIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
    Payment as PaymentIcon,
} from '@mui/icons-material';
import { tenantAPI } from '../../services/api';
import Billing from './Billing';

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ py: 3 }}>{children}</Box> : null;
}

export default function CompanySettings() {
    const [tab, setTab] = useState(0);
    const [company, setCompany] = useState(null);
    const [usage, setUsage] = useState(null);
    const [sites, setSites] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Company form
    const [form, setForm] = useState({
        name: '', legal_name: '', tax_id: '', industry: '',
        contact_email: '', contact_phone: '', website: '',
    });

    // Invite dialog
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' });

    // Site dialog
    const [siteOpen, setSiteOpen] = useState(false);
    const [siteForm, setSiteForm] = useState({
        name: '', address: '', city: '', district: '', country: 'Israel',
        contact_person: '', contact_phone: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [companyRes, usageRes, sitesRes, invitesRes] = await Promise.all([
                tenantAPI.getCompany(),
                tenantAPI.getUsage(),
                tenantAPI.listSites(),
                tenantAPI.listInvitations(),
            ]);
            setCompany(companyRes.data);
            setUsage(usageRes.data);
            setSites(sitesRes.data.results || sitesRes.data);
            setInvitations(invitesRes.data.results || invitesRes.data);
            setForm({
                name: companyRes.data.name || '',
                legal_name: companyRes.data.legal_name || '',
                tax_id: companyRes.data.tax_id || '',
                industry: companyRes.data.industry || '',
                contact_email: companyRes.data.contact_email || '',
                contact_phone: companyRes.data.contact_phone || '',
                website: companyRes.data.website || '',
            });
        } catch (err) {
            setError('Failed to load company data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await tenantAPI.updateCompany(form);
            setSuccess('Company settings saved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleInvite = async () => {
        try {
            setError('');
            await tenantAPI.createInvitation(inviteForm);
            setInviteOpen(false);
            setInviteForm({ email: '', role: 'viewer' });
            setSuccess('Invitation sent successfully');
            const res = await tenantAPI.listInvitations();
            setInvitations(res.data.results || res.data);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to send invitation');
        }
    };

    const handleCancelInvite = async (id) => {
        try {
            await tenantAPI.cancelInvitation(id);
            const res = await tenantAPI.listInvitations();
            setInvitations(res.data.results || res.data);
        } catch (err) {
            setError('Failed to cancel invitation');
        }
    };

    const handleCreateSite = async () => {
        try {
            setError('');
            await tenantAPI.createSite(siteForm);
            setSiteOpen(false);
            setSiteForm({ name: '', address: '', city: '', district: '', country: 'Israel', contact_person: '', contact_phone: '' });
            setSuccess('Site created successfully');
            const res = await tenantAPI.listSites();
            setSites(res.data.results || res.data);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create site');
        }
    };

    if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Company Settings
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Usage Cards */}
            {usage && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {['equipment', 'users', 'sites'].map((key) => (
                        <Grid item xs={12} sm={4} key={key}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" variant="body2">
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </Typography>
                                    <Typography variant="h5">
                                        {usage[key]?.current} / {usage[key]?.limit}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(100, (usage[key]?.current / usage[key]?.limit) * 100)}
                                        sx={{ mt: 1 }}
                                        color={usage[key]?.current >= usage[key]?.limit ? 'error' : 'primary'}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab icon={<BusinessIcon />} label="General" />
                    <Tab icon={<LocationIcon />} label="Sites" />
                    <Tab icon={<PeopleIcon />} label="Users & Invitations" />
                    <Tab icon={<PaymentIcon />} label="Billing" />
                </Tabs>

                {/* General Tab */}
                <TabPanel value={tab} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Company Name" value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Legal Name" value={form.legal_name}
                                    onChange={(e) => setForm({ ...form, legal_name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Tax ID (ח.פ.)" value={form.tax_id}
                                    onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Industry" value={form.industry}
                                    onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Contact Email" type="email"
                                    value={form.contact_email}
                                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Contact Phone" value={form.contact_phone}
                                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Website" value={form.website}
                                    onChange={(e) => setForm({ ...form, website: e.target.value })} />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {company && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Current Plan
                                </Typography>
                                <Chip
                                    label={company.plan?.toUpperCase()}
                                    color={company.plan === 'enterprise' ? 'secondary' : company.plan === 'professional' ? 'primary' : 'default'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                        )}

                        <Button variant="contained" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </TabPanel>

                {/* Sites Tab */}
                <TabPanel value={tab} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Sites</Typography>
                            <Button variant="contained" startIcon={<AddIcon />}
                                onClick={() => setSiteOpen(true)}>
                                Add Site
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>Address</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Equipment</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sites.map((site) => (
                                        <TableRow key={site.id}>
                                            <TableCell>{site.name}</TableCell>
                                            <TableCell>{site.city}</TableCell>
                                            <TableCell>{site.address}</TableCell>
                                            <TableCell>{site.contact_person}</TableCell>
                                            <TableCell>{site.equipment_count}</TableCell>
                                            <TableCell>
                                                <Chip label={site.is_active ? 'Active' : 'Inactive'}
                                                    color={site.is_active ? 'success' : 'default'} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sites.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No sites yet. Add your first site.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                {/* Users & Invitations Tab */}
                <TabPanel value={tab} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Invitations</Typography>
                            <Button variant="contained" startIcon={<MailIcon />}
                                onClick={() => setInviteOpen(true)}>
                                Invite User
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Invited By</TableCell>
                                        <TableCell>Expires</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invitations.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>{inv.email}</TableCell>
                                            <TableCell>
                                                <Chip label={inv.role} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={inv.status}
                                                    color={inv.status === 'pending' ? 'warning' :
                                                        inv.status === 'accepted' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{inv.invited_by_name}</TableCell>
                                            <TableCell>
                                                {new Date(inv.expires_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {inv.status === 'pending' && (
                                                    <IconButton size="small" color="error"
                                                        onClick={() => handleCancelInvite(inv.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {invitations.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No invitations yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                <TabPanel value={tab} index={3}>
                    <Billing />
                </TabPanel>
            </Paper>

            {/* Invite User Dialog */}
            <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Invite User</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Email" type="email" sx={{ mt: 1, mb: 2 }}
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={inviteForm.role} label="Role"
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="technician">Technician</MenuItem>
                            <MenuItem value="viewer">Viewer</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleInvite}
                        disabled={!inviteForm.email}>
                        Send Invitation
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Site Dialog */}
            <Dialog open={siteOpen} onClose={() => setSiteOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Site</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Site Name" required
                                value={siteForm.name}
                                onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address"
                                value={siteForm.address}
                                onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="City"
                                value={siteForm.city}
                                onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="District"
                                value={siteForm.district}
                                onChange={(e) => setSiteForm({ ...siteForm, district: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Contact Person"
                                value={siteForm.contact_person}
                                onChange={(e) => setSiteForm({ ...siteForm, contact_person: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Contact Phone"
                                value={siteForm.contact_phone}
                                onChange={(e) => setSiteForm({ ...siteForm, contact_phone: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSiteOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateSite}
                        disabled={!siteForm.name}>
                        Create Site
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
