import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/Equipment/EquipmentList';
import EquipmentDetail from './pages/Equipment/EquipmentDetail';
import EquipmentForm from './pages/Equipment/EquipmentForm';
import EquipmentImport from './pages/Equipment/EquipmentImport';
import InspectionList from './pages/Inspections/InspectionList';
import InspectionReportForm from './pages/Inspections/InspectionReportForm';
import DocumentList from './pages/Documents/DocumentList';
import IssueList from './pages/Issues/IssueList';
import MaintenanceCalendar from './pages/Maintenance/MaintenanceCalendar';
import TermsOfUse from './pages/Legal/TermsOfUse';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import Support from './pages/Legal/Support';

// Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="equipment" element={<EquipmentList />} />
                            <Route path="equipment/new" element={<EquipmentForm />} />
                            <Route path="equipment/import" element={<EquipmentImport />} />
                            <Route path="equipment/:id" element={<EquipmentDetail />} />
                            <Route path="equipment/:id/edit" element={<EquipmentForm />} />
                            <Route path="inspections" element={<InspectionList />} />
                            <Route path="inspections/report/new" element={<InspectionReportForm />} />
                            <Route path="documents" element={<DocumentList />} />
                            <Route path="issues" element={<IssueList />} />
                            <Route path="maintenance" element={<MaintenanceCalendar />} />
                            <Route path="terms" element={<TermsOfUse />} />
                            <Route path="privacy" element={<PrivacyPolicy />} />
                            <Route path="support" element={<Support />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
