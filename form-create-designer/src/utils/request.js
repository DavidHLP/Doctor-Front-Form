import axios from 'axios';

// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://localhost:8080', // 设置基础URL
    timeout: 5000 // 设置请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    config => {
    // 这里可以在发送请求之前做一些处理，例如设置请求头
        return config;
    },
    error => {
    // 处理请求错误
        console.error(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
    // 对响应数据进行处理
        return response.data;
    },
    error => {
    // 处理响应错误
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export default service;
