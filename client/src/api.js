import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API || 'http://localhost:5000/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const msg = e => e.response?.data?.message || 'Cannot reach the server. Check your connection.';
export default api;
