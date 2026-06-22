import axios from 'axios';

const publicTripApi = axios.create({
    baseURL: import.meta.env.VITE_TRIP_SERVICE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export default publicTripApi;