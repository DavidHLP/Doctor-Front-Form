import request from '@/utils/request';

export function ThrowJsonToBackend(data, name) {
    return request({
        url: '/doctor/insetJson/' + name,
        method: 'post',
        data
    });
}

export function GetJsonFromBackendById(id) {
    return request({
        url: '/doctor/throwformid/' + id,
        method: 'get',
    });
}

export function GetJsonFromBackendIsNotPatintId() {
    return request({
        url: '/doctor/getallhasnotpatientid/',
        method: 'get',
    });
}
