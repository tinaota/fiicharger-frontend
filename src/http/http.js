import { $GLOBAL_AUTH, $GLOBAL_CLIENT_ID, $GLOBAL_REDIRECT_URL } from "@/utils/global";
import axios from 'axios';
import qs from 'qs';
import router from '../router/index';
import store from '../store/store';
import * as types from '../store/types';
axios.defaults.withCredentials = true
axios.defaults.baseURL = ''
axios.defaults.timeout = 120000
axios.defaults.retry = 3
axios.defaults.retryDelay = 3000
axios.__axiosPromiseArr = [];
//axios.defaults.headers.post['zone'] = parseInt(-new Date().getTimezoneOffset());
//時區回復+08:00
// function getZone() {
//     const locTimeOffset = new Date().getTimezoneOffset(),
//           zoneHour = parseInt(locTimeOffset/-60),
//           zoneMin = locTimeOffset % 60;
//     let rsp = zoneHour > 0 ? "+":'-';
//     rsp += Math.abs(zoneHour).toString().padStart(2,'0')+":"+zoneMin.toString().padStart(2,'0');
//     return rsp;
// }
/**
 * @description 檢查api是否重複請求，若重複則取消前次請求。並適時更新當前api請求清單。
 */
let confirmApi = (url, isFinished) => {
    axios.__axiosPromiseArr.forEach((api, index) => {
        if (api.url === url) {
            if (!isFinished) api.cancel(); //duplicate
            axios.__axiosPromiseArr.splice(index, 1);
        }
    });
}

/**
 * @description 設定http 的request 請求攔截器 可用於設定cookie或token等附加信息
 */

axios.interceptors.request.use(
    config => {
        let url = config.url.split('/');
        url.splice(0, url.length - 2);
        url = url.join('/');
        const fiics_user = JSON.parse(
            localStorage.getItem("fiics-auth")
        )
        const token = fiics_user?.access_token;
        if (token) {
            config.headers["Authorization"] = "Bearer " + token;
        }
        confirmApi(url, false);
        return config;
    },
    err => {
        return Promise.reject(err);
    });

/**
 * @description 設定http 的response 請求攔截器 用於處理登錄超時
 */
axios.interceptors.response.use(
    response => {
        let url = response.config.url.split('/');
        url.splice(0, url.length - 2);
        url = url.join('/');
        confirmApi(url, true);
        return response;
    },
    async error => {
        //處理因為api cancel而引發的reject狀態
        if (axios.isCancel(error)) {
            error.response = {};
            error.response.status = 204;
        }
        const originalRequest = error.config;
        if (error.response.status === 204 || error.response.status === 404) {
            return Promise.reject(error.response)

        } else if (error.response.status === 401 && !originalRequest._retry) {
            let fiicsAuthData = JSON.parse(localStorage.getItem('fiics-auth'))
            let uuidValue = localStorage.getItem("fiics-uuid");

            const _data = {
                grant_type: "refresh_token",
                client_id: $GLOBAL_CLIENT_ID,
                refresh_token: fiicsAuthData.refresh_token,
                redirect_uri: $GLOBAL_REDIRECT_URL,
                device_id: uuidValue
            };

            var formBody = [];
            for (var property in _data) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(_data[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }

            formBody = formBody.join("&");
            let config = {
                header: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
            };
            originalRequest._retry = true;
            const res = await axios.post(`${$GLOBAL_AUTH}/auth/token`, formBody, config);
            if (res.status === 200) {
                let _data = res.data;
                localStorage.setItem("fiics-auth", JSON.stringify(_data));
                // Change Authorization header
                const fiics_auth = JSON.parse(
                    localStorage.getItem("fiics-auth")
                )
                const token = fiics_auth?.access_token;
                if (token) {
                    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
                }
                // return originalRequest object with Axios.
                return axios(originalRequest);
            }
            return await Promise.reject(error);

        }
        else {
            // route user to login screen if they get invalid grant or unauthorized
            if ((error?.response?.data?.error === 'invalid_grant' && error?.response?.status === 400) || (error?.response?.status === 401 && error?.response?.statusText === 'Unauthorized')) {
                store.commit(types.LOGOUT, JSON.stringify({}));
                // route to login page after showing an error
                setTimeout(() => {
                    router.push('/login');
                }, 1000)
            }
            return Promise.reject(error.response)

        }
    }
);

export function fetch(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params: params,
                paramsSerializer: (params) => {
                    return qs.stringify(params);
                }
            })
            .then((response) => {
                if (response) {
                    resolve(response.data);
                } else {
                    reject(response);
                }
            })
            .catch((err) => {
                if (err.status === 403) {
                    err["data"] = "Permission denied.";
                }
                err.status && err !== 204 && reject(err);
            });
    })
}

export function fetchImg(url) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            responseType: "arraybuffer",
        })
            .then(response => {
                if (response) {
                    let img = 'data:image/png;base64,' + btoa(
                        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    return resolve(img)
                } else {
                    reject(response)
                }
            })
            .catch(err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err !== 204 && reject(err)
            })
    })
}

export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }).catch(err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err.status !== 204 && reject(err)
            })
    })
}


export function put(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, params)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }, err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err.status !== 204 && reject(err)
            })
    })
}

export function putWithConfig(url, formData, config) {
    return new Promise((resolve, reject) => {
        axios.put(url, formData, config)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }, err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err.status !== 204 && reject(err)
            })
    })
}

export function patch(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, params)
            .then(response => {
                if (response) {
                    if (response.status === 204) {
                        resolve(response);
                    } else resolve(response.data);
                } else {
                    reject(response)
                }
            }, err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err.status !== 204 && reject(err)
            })
    })
}

export function del(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.delete(url, params)
            .then(response => {
                if (response) {
                    if (response.status === 204) {
                        resolve(response)
                    } else {
                        resolve(response.data)
                    }
                } else {
                    reject(response)
                }
            }, err => {
                if (err.status === 403) {
                    err['data'] = 'Permission denied.'
                }
                err.status && err.status !== 204 && reject(err)
            })
    })
}

export default axios;
