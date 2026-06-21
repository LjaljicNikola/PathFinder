import axios from 'axios';

const accountApi = axios.create({
    baseURL: import.meta.env.VITE_ACCOUNT_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

accountApi.interceptors.request.use((config) => {
    console.log('Request URL:', config.baseURL + config.url);
    const token = sessionStorage.getItem('pf_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

accountApi.interceptors.response.use(
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

export default accountApi;