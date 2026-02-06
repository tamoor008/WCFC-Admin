import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.115.204:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - no token or invalid token
        if (error.response?.status === 401) {
            // Clear invalid token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            // Return a more user-friendly error
            return Promise.reject({
                ...error,
                message: 'Authentication required. Please log in.',
                isAuthError: true,
            });
        }
        return Promise.reject(error);
    }
);

export const adminService = {
    getStats: (params?: any) => api.get('/admin/stats', { params }),
    getOrders: (params?: any) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
    assignDriver: (id: string, driverId: string) => api.patch(`/admin/orders/${id}/assign`, { driverId }),
    // Customers
    getCustomers: (params?: { page?: number; limit?: number; search?: string; status?: string }) => api.get('/admin/customers', { params }),
    getCustomer: (id: string) => api.get(`/admin/customers/${id}`),
    blockCustomer: (id: string, isBlocked: boolean) => api.patch(`/admin/customers/${id}/block`, { isBlocked }),
    createCustomer: (data: { name: string; email: string; password?: string; phone?: string; picture?: string }) => api.post('/admin/customers', data),
    uploadImage: (formData: FormData, type?: 'product' | 'category' | 'customer' | 'banner') => api.post(`/admin/upload-image${type ? `?type=${type}` : ''}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDrivers: () => api.get('/drivers'),
    getDriver: (id: string) => api.get(`/drivers/${id}`),
    // Products
    getProducts: (params?: any) => api.get('/products', { params }),
    getProduct: (id: string) => api.get(`/products/${id}`),
    createProduct: (productData: any) => api.post('/products', productData),
    updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
    deleteProduct: (id: string) => api.delete(`/products/${id}`),
    // Categories
    getCategories: () => api.get('/categories'),
    getCategory: (id: string) => api.get(`/categories/${id}`),
    createCategory: (categoryData: any) => api.post('/categories', categoryData),
    updateCategory: (id: string, categoryData: any) => api.put(`/categories/${id}`, categoryData),
    deleteCategory: (id: string) => api.delete(`/categories/${id}`),
    // Notifications
    sendNotification: (data: { title: string; body: string; target: string }) => api.post('/notifications/send', data),
    sendEmail: (data: { subject: string; message: string; targetGroup?: string; testEmail?: string }) => api.post('/admin/send-email', data),
    // Whitelist (invite-only signup)
    getWhitelist: (role: 'user' | 'driver' = 'user') => api.get('/admin/whitelist', { params: { role } }),
    addWhitelist: (email: string | string[], role: 'user' | 'driver' = 'user') =>
        Array.isArray(email)
            ? api.post('/admin/whitelist', { emails: email, role })
            : api.post('/admin/whitelist', { email, role }),
    removeWhitelist: (email: string) => api.delete(`/admin/whitelist/${encodeURIComponent(email)}`),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string }) => api.patch('/auth/me', data),
    getPlatformSettings: () => api.get('/admin/settings'),
    updatePlatformSettings: (data: { supportEmail?: string; appStoreLink?: string; playStoreLink?: string; driverAppStoreLink?: string; driverPlayStoreLink?: string; minOrderAmount?: number; deliveryFee?: number; autoAcceptReviews?: boolean }) => api.put('/admin/settings', data),
    // Config
    getAppConfig: () => api.get('/config'),
    updateAppConfig: (key: string, value: any) => api.post('/config', { key, value }),
    // Reviews
    getReviews: () => api.get('/reviews/admin'),
    updateReviewStatus: (id: string, status: 'approved' | 'rejected') => api.patch(`/reviews/admin/${id}/status`, { status }),
    // Danger Zone
    emptyDevEnvironment: () => api.post('/admin/danger/empty-dev'),
};

export default api;
