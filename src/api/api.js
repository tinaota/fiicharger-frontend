import axios from 'axios'
import qs from 'qs'
import { $GLOBAL_HTTP, $GLOBAL_CTRL } from '@/utils/global'
import { fetch, post } from '@/http/http'
import apiConfig from "../../config/apiConfig";
const base = $GLOBAL_HTTP;

/**
 * @description 取得帳戶列表
 */
export const $HTTP_getAccountList = params => { return post(`${base}/Home/Account/getAccountList`, qs.stringify(params)) }

/**
 * @description 取得帳戶資訊
 */
export const $HTTP_getAccountInfo = params => { return post(`${base}/Home/Account/getAccountInfo`, qs.stringify(params)) }

/**
 * @description 刪除帳戶資訊
 */
export const $HTTP_deleteAccount = params => { return post(`${base}/Home/Account/deleteAccount`, qs.stringify(params)) }

/**
 * @description 取得國碼選擇列表
 */
export const $HTTP_getCountryCodeSelectList = params => { return post(`${base}/Home/CountryCode/getCountryCodeSelectList`, qs.stringify(params)) }

/**
 * @description 新增充電站
 */
export const $HTTP_addStation= params => { return post(`${base}/ChargeStation/Station/addStation`, qs.stringify(params)) }

/**
 * @description 更新充電站資訊
 */
export const $HTTP_updateStation = params => { return post(`${base}/ChargeStation/Station/updateStation`, qs.stringify(params)) }

/**
 * @description 刪除充電站資訊
 */
export const $HTTP_deleteStation = params => { return post(`${base}/ChargeStation/Station/deleteStation`, qs.stringify(params)) }

/**
 * @description 取得充電站列表
 */
export const $HTTP_getStationList = params => { return post(`${base}/ChargeStation/Station/getStationList`, qs.stringify(params)) }

/**
 * @description 取得充電站列表(選單用)
 */
export const $HTTP_getStationListForSelect = params => { return post(`${base}/ChargeStation/Station/getStationListForSelect`, qs.stringify(params)) }

/**
 * @description 取得費率列表(選單用)
 */
export const $HTTP_getElectricityRateListForSelect = () => { return fetch(`${base}/ChargeStation/Setting/getElectricityRateListForSelect`) }

/**
 * @description 新增充電樁
 */
export const $HTTP_addChargeBox = params => { return post(`${base}/ChargeStation/ChargeBox/addChargeBox`, qs.stringify(params)) }

/**
 * @description 更新充電樁資訊
 */
export const $HTTP_updateChargeBox = params => { return post(`${base}/ChargeStation/ChargeBox/updateChargeBox`, qs.stringify(params)) }


/**
 * @description 刪除充電樁
 */
export const $HTTP_deleteChargeBox = params => { return post(`${base}/ChargeStation/ChargeBox/deleteChargeBox`, qs.stringify(params)) }

/**
 * @description 取得充電樁列表
 */
export const $HTTP_getChargeBoxList = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxList`, qs.stringify(params)) }

/**
 * @description 取得充電樁列表（選單用）
 */
export const $HTTP_getChargeBoxListForSelect = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxListForSelect`, qs.stringify(params)) }

/**
 * @description 取得區域編碼列表（選單用）
 */
export const $HTTP_getZipCodeListForSelect = params => { return post(`${base}/Home/Location/getZipCodeListForSelect`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄列表
 */
export const $HTTP_getChargingSessionList = params => { return post(`${base}/ChargeStation/ChargingSession/getChargingSessionList`, qs.stringify(params)) }

/**
 * @description 取得充電站明細
 */
export const $HTTP_getStationDetail = params => { return post(`${base}/ChargeStation/Station/getStationDetail`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄分析資訊
 */
export const $HTTP_getChargingSessionAnalysisInfo = params => { return post(`${base}/ChargeStation/Station/getChargingSessionAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 取得充電用電量分析資訊
 */
export const $HTTP_getPowerUsageAnalysisInfo = params => { return post(`${base}/ChargeStation/Station/getPowerUsageAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 取得充電樁地圖打點列表
 */
export const $HTTP_getChargeBoxListForMap = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxListForMap`, qs.stringify(params)) }

/**
 * @description 取得充電樁地圖打點資訊
 */
export const $HTTP_getChargeBoxInfoForMap = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxInfoForMap`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄明細
 */
export const $HTTP_getChargingSessionDetail = params => { return post(`${base}/ChargeStation/ChargingSession/getChargingSessionDetail`, qs.stringify(params)) }

/**
 * @description 取得充電統計資訊
 */
export const $HTTP_getChargingStatisticsInfo = params => { return post(`${base}/Home/Statistics/getChargingStatisticsInfo`, qs.stringify(params)) }

/**
 * @description 取得電耗量前十名資訊列表
 */
export const $HTTP_getPowerUsageTop10List = params => { return post(`${base}/Home/Statistics/getPowerUsageTop10List`, qs.stringify(params)) }

/**
 * @description 取得總收益前十名資訊列表
 */
export const $HTTP_getRevenueTop10List = params => { return post(`${base}/Home/Statistics/getRevenueTop10List`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄次數前十名資訊列表
 */
export const $HTTP_getChargingSessionCountTop10List = params => { return post(`${base}/Home/Statistics/getChargingSessionCountTop10List`, qs.stringify(params)) }

/**
 * @description 取得故障狀態次數前五名資訊列表
 */
export const $HTTP_getFaultCountTop5List = params => { return post(`${base}/Home/Statistics/getFaultCountTop5List`, qs.stringify(params)) }