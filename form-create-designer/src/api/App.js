import request from '../utils/request';

export function ThrowJsonToBackend(data) {
    return request({
        url: '/doctor/getjson',
        method: 'post',
        data
    });
}