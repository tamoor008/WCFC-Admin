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

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getOrders: () => api.get('/admin/orders'),
    updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
    getProducts: () => api.get('/products'),
    createProduct: (productData: any) => api.post('/products', productData),
};

export default api;
