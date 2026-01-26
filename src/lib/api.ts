import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
    // Customers
    getCustomers: (params?: any) => api.get('/admin/customers', { params }),
    getCustomer: (id: string) => api.get(`/admin/customers/${id}`),
    blockCustomer: (id: string, isBlocked: boolean) => api.patch(`/admin/customers/${id}/block`, { isBlocked }),
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
    // Whitelist (invite-only signup)
    getWhitelist: () => api.get('/admin/whitelist'),
    addWhitelist: (email: string | string[]) =>
        Array.isArray(email)
            ? api.post('/admin/whitelist', { emails: email })
            : api.post('/admin/whitelist', { email }),
    removeWhitelist: (email: string) => api.delete(`/admin/whitelist/${encodeURIComponent(email)}`),
    logout: () => api.post('/auth/logout'),
    updateProfile: (data: { name?: string }) => api.patch('/auth/me', data),
};

export default api;
