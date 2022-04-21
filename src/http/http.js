import axios from 'axios'
import { apiConfig } from '@/assets/js/appConfig'
import store from '../store/store'
import * as types from '../store/types'
import router from '../router/index'
import { Message } from 'element-ui'
import i18n from '../lang/lang'

axios.defaults.withCredentials = true
axios.defaults.baseURL = apiConfig.baseUrl
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
        const token = JSON.parse(
            sessionStorage?.getItem("fiics-auth")
        )?.access_token;
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
    error => {
        //處理因為api cancel而引發的reject狀態
        if (axios.isCancel(error)) {
            error.response = {};
            error.response.status = 204;
        }
        const originalRequest = error.config;
        if (error.response.status === 204 || error.response.status === 404) {
            return Promise.reject(error.response)

        } else if (error.response.status === 401 && !originalRequest._retry) {
            let fiicsAuthData = JSON.parse(sessionStorage.getItem('fiics-auth'))
            const _data = {
                grant_type: "refresh_token",
                client_id: "gatekeeper",
                refresh_token: fiicsAuthData?.refresh_token,
                redirect_uri: process.env.VUE_APP_REDIRECT_URL,
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
            return axios.post(`/Gatekeeper/auth/token`, formBody, config).then(res => {

                if (res.status === 200) {
                    let _data = res?.data;
                    sessionStorage.setItem("fiics-auth", JSON.stringify(_data));
                    // Change Authorization header
                    const token = JSON.parse(
                        sessionStorage?.getItem("fiics-auth")
                    )?.access_token;
                    if (token) {
                        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
                    }
                    // return originalRequest object with Axios.
                    return axios(originalRequest);
                }
                return Promise.reject(error);

            })

        }
        else {
            // store.commit(types.LOGOUT);
            // router.replace({ path: '/login' });
            // Message({ type: 'warning', message: i18n.t('login.timeout') });
            return Promise.reject(error.response)

        }
    }
);

export function fetch(url, params = {}) {
    axios.defaults.baseURL = apiConfig.baseUrl;
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        })
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            })
            .catch(err => {
                err.status && err != 204 && reject(err)
            })
    })
}

export function fetchImg(url) {
    axios.defaults.baseURL = apiConfig.baseUrl;
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
                err.status && err != 204 && reject(err)
            })
    })
}

export function post(url, params = {}) {
    axios.defaults.baseURL = apiConfig.baseUrl;
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }, err => {
                err.status && err.status != 204 && reject(err)
            })
    })
}


export function put(url, params = {}) {
    axios.defaults.baseURL = apiConfig.baseUrl;
    return new Promise((resolve, reject) => {
        axios.put(url, params)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }, err => {
                err.status && err.status != 204 && reject(err)
            })
    })
}


export function del(url, params = {}) {
    axios.defaults.baseURL = apiConfig.baseUrl;
    return new Promise((resolve, reject) => {
        axios.delete(url, params)
            .then(response => {
                if (response) {
                    resolve(response.data)
                } else {
                    reject(response)
                }
            }, err => {
                err.status && err.status != 204 && reject(err)
            })
    })
}

export default axios;