import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('accessToken', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API methods
export const authAPI = {
    login: (credentials) => apiClient.post('/token/', credentials),
    refresh: (refreshToken) => apiClient.post('/token/refresh/', { refresh: refreshToken }),
    getCurrentUser: () => apiClient.get('/users/me/'),
};

export const equipmentAPI = {
    list: (params) => apiClient.get('/equipment/', { params }),
    options: () => apiClient.get('/equipment/options/'),
    get: (id) => apiClient.get(`/equipment/${id}/`),
    create: (data) => apiClient.post('/equipment/', data),
    update: (id, data) => apiClient.patch(`/equipment/${id}/`, data),
    delete: (id) => apiClient.delete(`/equipment/${id}/`),
    bulkDelete: (ids) => apiClient.post('/equipment/bulk-delete/', { ids }),
    stats: () => apiClient.get('/equipment/stats/'),
    exportCSV: (params) => {
        return apiClient.get('/equipment/export_csv/', {
            params,
            responseType: 'blob'
        });
    },
    exportExcel: (params) => {
        return apiClient.get('/equipment/export_excel/', {
            params,
            responseType: 'blob'
        });
    },
    importCSV: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/equipment/import_csv/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    importExcel: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/equipment/import_excel/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    generatePDF: (id) => {
        return apiClient.get(`/equipment/${id}/generate-pdf/`, {
            responseType: 'blob'
        });
    },
    getQRCode: (id, format = 'png') => {
        return apiClient.get(`/equipment/${id}/qr-code/`, {
            params: { format },
            responseType: 'blob'
        });
    },
    getPhotos: (equipmentId) => apiClient.get(`/equipment/${equipmentId}/photos/`),
    uploadPhoto: (equipmentId, formData) => {
        return apiClient.post(`/equipment/${equipmentId}/photos/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const inspectionAPI = {
    list: (params) => apiClient.get('/inspections/', { params }),
    get: (id) => apiClient.get(`/inspections/${id}/`),
    create: (data) => apiClient.post('/inspections/', data),
    update: (id, data) => apiClient.patch(`/inspections/${id}/`, data),
    delete: (id) => apiClient.delete(`/inspections/${id}/`),
};

export const inspectionReportAPI = {
    list: (params) => apiClient.get('/inspections/reports/', { params }),
    get: (id) => apiClient.get(`/inspections/reports/${id}/`),
    create: (data) => apiClient.post('/inspections/reports/', data),
    update: (id, data) => apiClient.patch(`/inspections/reports/${id}/`, data),
    generatePDF: (id) => apiClient.post(`/inspections/reports/${id}/generate_pdf/`),
    finalize: (id) => apiClient.post(`/inspections/reports/${id}/finalize/`),
    approve: (id) => apiClient.post(`/inspections/reports/${id}/approve/`),
};

export const documentAPI = {
    list: (params) => apiClient.get('/documents/', { params }),
    get: (id) => apiClient.get(`/documents/${id}/`),
    upload: (formData) => {
        return apiClient.post('/documents/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    delete: (id) => apiClient.delete(`/documents/${id}/`),
    exportExcel: (params) => {
        return apiClient.get('/documents/export_excel/', {
            params,
            responseType: 'blob'
        });
    },
};

export const issueAPI = {
    list: (params) => apiClient.get('/issues/', { params }),
    get: (id) => apiClient.get(`/issues/${id}/`),
    create: (data) => apiClient.post('/issues/', data),
    update: (id, data) => apiClient.patch(`/issues/${id}/`, data),
    addComment: (id, comment) => apiClient.post(`/issues/${id}/add_comment/`, { comment }),
    resolve: (id, notes) => apiClient.post(`/issues/${id}/resolve/`, { resolution_notes: notes }),
    close: (id) => apiClient.post(`/issues/${id}/close/`),
};

export const notificationAPI = {
    list: (params) => apiClient.get('/core/notifications/', { params }),
    unreadCount: () => apiClient.get('/core/notifications/unread_count/'),
    markRead: (ids) => apiClient.post('/core/notifications/mark_read/', { notification_ids: ids }),
    markAllRead: () => apiClient.post('/core/notifications/mark_all_read/'),
};

export const activityLogAPI = {
    list: (params) => apiClient.get('/core/activity-log/', { params }),
    entityTimeline: (entityType, entityId) =>
        apiClient.get('/core/activity-log/entity_timeline/', {
            params: { entity_type: entityType, entity_id: entityId }
        }),
};

export const maintenanceAPI = {
    schedules: {
        list: (params) => apiClient.get('/maintenance/schedules/', { params }),
        get: (id) => apiClient.get(`/maintenance/schedules/${id}/`),
        create: (data) => apiClient.post('/maintenance/schedules/', data),
        update: (id, data) => apiClient.patch(`/maintenance/schedules/${id}/`, data),
        delete: (id) => apiClient.delete(`/maintenance/schedules/${id}/`),
    },
    tasks: {
        list: (params) => apiClient.get('/maintenance/tasks/', { params }),
        get: (id) => apiClient.get(`/maintenance/tasks/${id}/`),
        create: (data) => apiClient.post('/maintenance/tasks/', data),
        update: (id, data) => apiClient.patch(`/maintenance/tasks/${id}/`, data),
        delete: (id) => apiClient.delete(`/maintenance/tasks/${id}/`),
        calendar: (start, end) => apiClient.get('/maintenance/tasks/calendar/', { params: { start, end } }),
        overdue: () => apiClient.get('/maintenance/tasks/overdue/'),
    },
};

// Helper function for CSV upload
export const uploadEquipmentCSV = (file) => equipmentAPI.importCSV(file);

// Helper function for CSV/XLSX upload
export const uploadEquipmentFile = (file) => {
    const name = file?.name?.toLowerCase?.() || '';
    if (name.endsWith('.xlsx')) {
        return equipmentAPI.importExcel(file);
    }
    return equipmentAPI.importCSV(file);
};

// Tenants / Company API
export const tenantAPI = {
    getCompany: () => apiClient.get('/tenants/company/my/'),
    updateCompany: (data) => apiClient.patch('/tenants/company/', data),
    updateCompanyLogo: (formData) => apiClient.patch('/tenants/company/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getUsage: () => apiClient.get('/tenants/company/usage/'),
    getSubscription: () => apiClient.get('/tenants/subscription/'),

    // Sites
    listSites: (params) => apiClient.get('/tenants/sites/', { params }),
    getSite: (id) => apiClient.get(`/tenants/sites/${id}/`),
    createSite: (data) => apiClient.post('/tenants/sites/', data),
    updateSite: (id, data) => apiClient.patch(`/tenants/sites/${id}/`, data),
    deleteSite: (id) => apiClient.delete(`/tenants/sites/${id}/`),

    // Invitations
    listInvitations: (params) => apiClient.get('/tenants/invitations/', { params }),
    createInvitation: (data) => apiClient.post('/tenants/invitations/', data),
    cancelInvitation: (id) => apiClient.delete(`/tenants/invitations/${id}/`),
    validateInvitation: (token) => apiClient.get('/tenants/validate-invitation/', {
        params: { token },
    }),

    // Auth flows
    signup: (data) => apiClient.post('/tenants/signup/', data),
    acceptInvitation: (data) => apiClient.post('/tenants/accept-invitation/', data),

    // Billing / Stripe
    billingConfig: () => apiClient.get('/tenants/billing/config/'),
    createCheckout: (data) => apiClient.post('/tenants/billing/checkout/', data),
    createPortal: (data) => apiClient.post('/tenants/billing/portal/', data),
    cancelSubscription: () => apiClient.post('/tenants/billing/cancel/'),
};

export default apiClient;
