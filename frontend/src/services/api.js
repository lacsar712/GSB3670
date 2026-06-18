import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60s - AI 生成请求可能耗时较长
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res.code !== 200) {
            message.error(res.message || '操作失败');
            return Promise.reject(new Error(res.message || '操作失败'));
        }
        return res.data;
    },
    (error) => {
        const msg = error.response?.data?.message || (error.response?.status === 403 ? '登录已过期或无权限，请重新登录' : '网络错误');
        message.error(msg);
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
        return Promise.reject(error);
    }
);

export default api;
