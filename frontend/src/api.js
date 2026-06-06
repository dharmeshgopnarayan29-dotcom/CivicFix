import axios from 'axios';

/**
 * Authenticated API client.
 * Uses withCredentials so the browser automatically sends HttpOnly
 * JWT cookies — no tokens are stored in JS/localStorage.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    withCredentials: true,
});

/**
 * Public API client for unauthenticated endpoints (e.g. /issues/public/).
 * Does NOT send cookies — avoids CORS preflight issues for public pages.
 */
export const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    withCredentials: false,
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
