import axios from 'axios'
import qs from 'qs'
import { $GLOBAL_HTTP, $GLOBAL_CTRL, $GLOBAL_AUTH } from '@/utils/global'
import { fetch, post, fetchImg, put, del } from '@/http/http'
import { apiConfig } from "@/assets/js/appConfig";
const base = $GLOBAL_HTTP;
const base_auth = $GLOBAL_AUTH
/**
 * @description 登入
 */
export const $HTTP_login = params => { return post(`${base}/Home/Login/login`, qs.stringify(params)) }


/**
 * @description Login with authorization code
 */
export const $HTTP_login_auth = params => {
  return post(`${base_auth}/auth/token`, params);
}

export const $HTTP_getRoles = params => {
  let id = params.id;
  return fetch(`Gatekeeper/api/Users/${id}/roles`, params)
}

export const $HTTP_addRoles = params => {
  let id = params.id;
  let roles = params.roles;
  return put(`Gatekeeper/api/Users/${id}/roles`, roles)
}


/**
 * @description 登出
 */
// export const $HTTP_logout = () => { return fetch(`${base}/Home/Login/logout`) }
export const $HTTP_logout = (params) => { return post(`Gatekeeper/auth/revoke`, qs.stringify(params)) }

/**
 * @description 取得圖形驗證碼
 */
export const $HTTP_getCaptcha = () => { return fetchImg(`${base}/Home/Login/getCaptcha`) }

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
 * @description 取得區域編碼列表（選單用）
 */
export const $HTTP_getZipCodeListForSelect = params => { return post(`${base}/Home/Location/getZipCodeListForSelect`, qs.stringify(params)) }


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

/**
 * @description 取得充電時長分析資訊
 */
export const $HTTP_getChargingTimeAnalysisInfo = params => { return post(`${base}/Home/Statistics/getChargingTimeAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 取得充電累積電量分析資訊
 */
export const $HTTP_getChargingPowerUsageAnalysisInfo = params => { return post(`${base}/Home/Statistics/getChargingPowerUsageAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 取得付款紀錄列表
 */
export const $HTTP_getBillingList = params => { return post(`${base}/Home/Billing/getBillingList`, qs.stringify(params)) }

/**
 * @description 取得汽車品牌列表給選單
 */
// export const $HTTP_getCarBrandListForSelect = params => { return post(`${base}/Home/Car/getCarBrandListForSelect`, qs.stringify(params)) }
export const $HTTP_getCarBrandListForSelect = params => { return fetch(`/Vehicle/api/vehicles/makes`, (params)) }

export const $HTTP_getCarModelListForSelect = params => { return fetch(`/Vehicle/api/vehicles/makes/${params.make}/models`, (params)) }

/**
 * @description 取得汽車資訊
 */
// export const $HTTP_getCarInfo = params => { return post(`${base}/Home/Car/getCarInfo`, qs.stringify(params)) }
export const $HTTP_getCarInfo = params => {
  let carId = params.carId
  return fetch(`/Vehicle/api/vehicles/${carId}`)
}

/**
 * @description 取得工單列表
 */
export const $HTTP_getWorkOrderList = params => { return post(`${base}/Home/WorkOrder/getWorkOrderList`, qs.stringify(params)) }

/**
 * @description 取得汽車列表
 */
// export const $HTTP_getCarList = params => { return post(`${base}/Home/Car/getCarList`, qs.stringify(params)) }
export const $HTTP_getCarList = params => { return fetch(`/Vehicle/api/vehicles/detailed`, (params)) }

/**
 * @description 取得運營商列表
 */
// export const $HTTP_getOperatorList = params => { return post(`${base}/Home/Operator/getOperatorList`, qs.stringify(params)) }
export const $HTTP_getOperatorList = params => {
  return fetch(`/Gatekeeper/api/Users`, (params))
}

/**
 * @description 新增運營商
 */
// export const $HTTP_addOperator = params => { return post(`${base}/Home/Operator/addOperator`, qs.stringify(params)) }
export const AddOperator = apiConfig.baseUrl + base + '/Home/Operator/addOperator';

/**
 * @description 更新運營商資訊
 */
// export const $HTTP_updateOperator = params => { return post(`${base}/Home/Operator/updateOperator`, qs.stringify(params)) }
export const $HTTP_registerOperator = params => { return post(`Gatekeeper/api/Users/register`, (params)) }

export const $HTTP_updateOperator = params => { return put(`Gatekeeper/api/Users/${params.id}`, (params)) }

export const UpdateOperator = apiConfig.baseUrl + base + '/Home/Operator/updateOperator';

/**
 * @description 更新運營商密碼資訊
 */
// export const $HTTP_updateOperatorPassword = params => { return post(`${base}/Home/Operator/updateOperatorPassword`, qs.stringify(params)) }

export const $HTTP_updateOperatorPassword = params => {
  return put(`Gatekeeper/api/Users/${params.id}/password`, params)
}

export const $HTTP_deleteOperatorPassword = params => {
  return del(`Gatekeeper/api/Users/${params.id}`)
}

/**
 * @description 取得運營商操作維修員列表
 */
export const $HTTP_getOperatorMaintainerList = params => { return post(`${base}/Home/Operator/getOperatorMaintainerList`, qs.stringify(params)) }

/**
 * @description 新增運營商操作維修員
 */
export const $HTTP_addOperatorMaintainer = params => { return post(`${base}/Home/Operator/addOperatorMaintainer`, qs.stringify(params)) }

/**
 * @description 更新運營商操作維修員資訊
 */
export const $HTTP_updateOperatorMaintainer = params => { return post(`${base}/Home/Operator/updateOperatorMaintainer`, qs.stringify(params)) }

/**
 * @description 更新運營商操作維修員密碼資訊
 */
export const $HTTP_updateOperatorMaintainerPassword = params => { return post(`${base}/Home/Operator/updateOperatorMaintainerPassword`, qs.stringify(params)) }

/**
 * @description 刪除運營商操作維修員
 */
export const $HTTP_deleteOperatorMaintainer = params => { return post(`${base}/Home/Operator/deleteOperatorMaintainer`, qs.stringify(params)) }

/**
 * @description 取得會員RFID列表
 */
export const $HTTP_getIdTagList = params => { return post(`${base}/Home/IdTag/getIdTagList`, qs.stringify(params)) }

/**
 * @description 新增RFID
 */
export const $HTTP_addIdTag = params => { return post(`${base}/Home/IdTag/addIdTag`, qs.stringify(params)) }

/**
 * @description 更新RFID
 */
export const $HTTP_updateIdTag = params => { return post(`${base}/Home/IdTag/updateIdTag`, qs.stringify(params)) }

/**
 * @description 刪除RFID
 */
export const $HTTP_deleteIdTag = params => { return post(`${base}/Home/IdTag/deleteIdTag`, qs.stringify(params)) }

/**
 * @description 取得評價列表
 */
export const $HTTP_getValuationList = params => { return post(`${base}/Home/Valuation/getValuationList`, qs.stringify(params)) }

/**
 * @description 取得維修商列表
 */
export const $HTTP_getMaintainerList = params => { return post(`${base}/Home/Maintainer/getMaintainerList`, qs.stringify(params)) }

/**
 * @description 新增維修人員
 */
export const $HTTP_addMaintainer = params => { return post(`${base}/Home/Maintainer/addMaintainer`, qs.stringify(params)) }

/**
 * @description 更新維修人員資訊
 */
export const $HTTP_updateMaintainer = params => { return post(`${base}/Home/Maintainer/updateMaintainer`, qs.stringify(params)) }

/**
 * @description 更新維修人員密碼資訊
 */
export const $HTTP_updateMaintainerPassword = params => { return post(`${base}/Home/Maintainer/updateMaintainerPassword`, qs.stringify(params)) }

/**
 * @description 刪除維修人員
 */
export const $HTTP_deleteMaintainer = params => { return post(`${base}/Home/Maintainer/deleteMaintainer`, qs.stringify(params)) }

/**
 * @description 取得客服人員列表
 */
export const $HTTP_getCustomerServiceList = params => { return post(`${base}/Home/CustomerService/getCustomerServiceList`, qs.stringify(params)) }

/**
 * @description 新增客服人員
 */
export const $HTTP_addCustomerService = params => { return post(`${base}/Home/CustomerService/addCustomerService`, qs.stringify(params)) }

/**
 * @description 更新客服人員資訊
 */
export const $HTTP_updateCustomerService = params => { return post(`${base}/Home/CustomerService/updateCustomerService`, qs.stringify(params)) }

/**
 * @description 更新客服人員密碼資訊
*/
export const $HTTP_updateCustomerServicePassword = params => { return post(`${base}/Home/CustomerService/updateCustomerServicePassword`, qs.stringify(params)) }

/**
 * @description 刪除客服人員
 */
export const $HTTP_deleteCustomerService = params => { return post(`${base}/Home/CustomerService/deleteCustomerService`, qs.stringify(params)) }

/**
 * @description 新增充電站
 */
export const $HTTP_addStation = params => { return post(`${base}/ChargeStation/Station/addStation`, qs.stringify(params)) }

/**
 * @description 新增Kiosk
 */
export const $HTTP_addKiosk = params => { return post(`${base}/ChargeStation/Kiosk/addKiosk`, qs.stringify(params)) }

/**
 * @description 更新充電站資訊
 */
export const $HTTP_updateStation = params => { return post(`${base}/ChargeStation/Station/updateStation`, qs.stringify(params)) }

/**
 * @description 取得充電站明細列表
 */
export const $HTTP_getStationDetailList = params => {
  return post(`${base}/ChargeStation/Station/getStationAndChargeboxList`, qs.stringify(params))
}

/**
 * @description 更新Kiosk資訊
 */
export const $HTTP_updateKiosk = params => { return post(`${base}/ChargeStation/Kiosk/updateKiosk`, qs.stringify(params)) }


/**
 * @description 刪除充電站資訊
 */
export const $HTTP_deleteStation = params => { return post(`${base}/ChargeStation/Station/deleteStation`, qs.stringify(params)) }

/**
 * @description 刪除Kiosk資訊
 */
export const $HTTP_deleteKiosk = params => { return post(`${base}/ChargeStation/Kiosk/deleteKiosk`, qs.stringify(params)) }


/**
 * @description 取得充電站列表
 */
export const $HTTP_getStationList = params => {
  return post(`${base}/ChargeStation/Station/getStationList`, qs.stringify(params))
}

/**
 * @description 取得充電站列表(選單用)
 */
export const $HTTP_getStationListForSelect = params => { return post(`${base}/ChargeStation/Station/getStationListForSelect`, qs.stringify(params)) }

/**
 * @description 取得充電站明細
 */
export const $HTTP_getStationDetail = params => { return post(`${base}/ChargeStation/Station/getStationDetail`, qs.stringify(params)) }

/**
 * @description 取得Kiosk明細
 */
export const $HTTP_getKioskDetail = params => { return post(`${base}/ChargeStation/Kiosk/getKioskDetail`, qs.stringify(params)) }


/**
 * @description 取得Kiosk列表
 */
export const $HTTP_getKioskList = params => { return post(`${base}/ChargeStation/Kiosk/getKioskList`, qs.stringify(params)) }


/**
 * @description 取得充電紀錄分析資訊
 */
export const $HTTP_getChargingSessionAnalysisInfo = params => { return post(`${base}/ChargeStation/Station/getChargingSessionAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 取得充電用電量分析資訊
 */
export const $HTTP_getPowerUsageAnalysisInfo = params => { return post(`${base}/ChargeStation/Station/getPowerUsageAnalysisInfo`, qs.stringify(params)) }

/**
 * @description 新增充電站充電樁綁定
 */
export const $HTTP_addStationChargeBoxMatch = params => { return post(`${base}/ChargeStation/Station/addStationChargeBoxMatch`, params) }

/**
 * @description 新增Kiosk充電樁綁定
 */
export const $HTTP_addKioskChargeBoxMatch = params => { return post(`${base}/ChargeStation/Kiosk/addKioskChargeBoxMatch`, params) }


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
 * @description 取得充電樁地圖打點列表
 */
export const $HTTP_getChargeBoxListForMap = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxListForMap`, qs.stringify(params)) }

/**
 * @description 取得充電樁列表（綁定用）
 */
export const $HTTP_getChargeBoxListForBinding = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxListForBinding`, qs.stringify(params)) }

/**
 * @description 取得充電樁列表（Kiosk綁定用）
 */
export const $HTTP_getChargeBoxListForKioskBinding = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxListForKioskBinding`, qs.stringify(params)) }

/**
 * @description 取得充電樁地圖打點資訊
 */
export const $HTTP_getChargeBoxInfoForMap = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxInfoForMap`, qs.stringify(params)) }

/**
 * @description 取得充電樁明細
 */
export const $HTTP_getChargeBoxDetail = params => { return post(`${base}/ChargeStation/ChargeBox/getChargeBoxDetail`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄列表
 */
export const $HTTP_getChargingSessionList = params => { return post(`${base}/ChargeStation/ChargingSession/getChargingSessionList`, qs.stringify(params)) }

/**
 * @description 取得充電紀錄明細
 */
export const $HTTP_getChargingSessionDetail = params => { return post(`${base}/ChargeStation/ChargingSession/getChargingSessionDetail`, qs.stringify(params)) }

/**
 * @description 取得充電告警列表
 */
export const $HTTP_getChargeAlertList = params => { return post(`${base}/ChargeStation/Alert/getChargeAlertList`, qs.stringify(params)) }

/**
 * @description 取得充電歷史告警列表
 */
export const $HTTP_getChargeHistoryAlertList = params => { return post(`${base}/ChargeStation/Alert/getChargeHistoryAlertList`, qs.stringify(params)) }
