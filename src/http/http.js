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
axios.defaults.headers.post['zone'] = parseInt(-new Date().getTimezoneOffset());
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
            if(!isFinished) api.cancel(); //duplicate
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
        url.splice(0,url.length-2);
        url = url.join('/');
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
        url.splice(0, url.length-2);
        url = url.join('/');
        confirmApi(url, true);
        // 根據返回請求判斷是否重新路由
        if (!response.data.success) {
            if (response.data.code === 10010) { // 登錄超時 自動登出
                store.commit(types.LOGOUT);
                router.replace({ path: '/login'});
                Message({ type: 'warning', message: i18n.t('login.timeout')});
                return Promise.reject(error.response.data)
            }
            //  else if (response.data.code === 402) {
            //     //無新增 修改 刪除 權限不用重新登入
            //     Message({ type: 'warning', message: i18n.t('login.noPermission') });
            // }
        }
        return response;
    },
    error => {
        //處理因為api cancel而引發的reject狀態
        if (axios.isCancel(error)) {
            error.response = {};
            error.response.status = 204;
        }

        if (error.response) {
            switch (error.response.status) {
                case 204:
                    //取消api狀態碼
                    return Promise.reject(error.response)
                case 404:
                    return Promise.reject(error.response)
            }
            return Promise.reject(error.response.data)
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
                err.status && err != 204 &&  reject(err)
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
                err.status && err != 204 &&  reject(err)
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
                err.status && err.status != 204 &&  reject(err)
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
                err.status && err.status != 204 &&  reject(err)
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
                err.status && err.status != 204 &&  reject(err)
            })
    })
}

export default axios;