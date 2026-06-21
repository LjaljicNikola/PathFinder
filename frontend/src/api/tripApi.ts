import axios from 'axios';

const tripApi = axios.create({
    baseURL: import.meta.env.VITE_TRIP_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

tripApi.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('pf_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

tripApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('pf_token');
            sessionStorage.removeItem('pf_user');
            window.location.href = '/prijava';
        }
        return Promise.reject(error);
    }
);

export default tripApi;