import axios from 'axios'
import qs from 'qs'
import { $GLOBAL_HTTP, $GLOBAL_CTRL } from '@/utils/global'
import { fetch, post } from '@/http/http'
import apiConfig from "../../config/apiConfig";
const base = $GLOBAL_HTTP;

/**
 * @description 取得帳戶列表
 */
export const $HTTP_getAccountList = params => { return post(`${base}/Account/getAccountList`, qs.stringify(params)) }

/**
 * @description 取得帳戶資訊
 */
export const $HTTP_getAccountInfo = params => { return post(`${base}/Account/getAccountInfo`, qs.stringify(params)) }