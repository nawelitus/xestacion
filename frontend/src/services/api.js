import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? '/api'  
  : 'http://localhost:4000/api'; 

const api = axios.create({ baseURL });

// Interceptor para añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;//*