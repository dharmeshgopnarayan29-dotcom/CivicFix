import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMediaUrl = (photoPath) => {
    if (!photoPath) return '';
    
    // Auto-upgrade http to https on secure sites (prevents Mixed Content errors)
    if (photoPath.startsWith('http')) {
        if (window.location.protocol === 'https:' && photoPath.startsWith('http:')) {
            return photoPath.replace('http:', 'https:');
        }
        return photoPath;
    }
    
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
    baseUrl = baseUrl.replace(/\/api\/?$/, '');
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    let path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    if (!path.startsWith('/media/')) {
        path = `/media${path}`;
    }
    
    return `${baseUrl}${path}`;
};

export default api;
