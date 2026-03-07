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

export default apiClient;
