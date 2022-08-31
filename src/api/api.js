import { del, fetch, patch, post, put, putWithConfig } from '@/http/http'
import { $GLOBAL_AUTH, $GLOBAL_CHARGER, $GLOBAL_VEHICLE } from '@/utils/global'
import qs from 'qs'
const base_auth = $GLOBAL_AUTH
const base_vehicle = $GLOBAL_VEHICLE
const base_charger = $GLOBAL_CHARGER
let configForAppJson = {
    headers: {
        "Content-Type": "application/json"
    }
};
//login with authorization code
export const $HTTP_login_auth = params => {
    return post(`${base_auth}/auth/token`, params);
}

export const $HTTP_getUserInfo = () => {
    return fetch(`${base_auth}/api/Users/user-info`)
}

export const $HTTP_getRoles = params => {
    let id = params.id;
    return fetch(`${base_auth}/api/Users/${id}/roles`, params)
}

export const $HTTP_updateImage = params => {
    return putWithConfig(`${base_auth}/api/Users/${params.id}/picture`, params.formData, params.config)
}
//OCPP
//OCPP availability
export const $HTTP_updateOccpAvailability = (params) => {
    return post(
        `${base_charger}/api/ocpp/charge-points/${params.chargePointId}/change-availability`,
        params
    );
}

//get configurations of each chargepoint
export const $HTTP_getConfiguration = (params) => {
    return fetch(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/configuration`,{keys: params.keys})
}

//update configurations of each chargepoint
export const $HTTP_updateConfiguration = (params) => {
    return putWithConfig(
        `${base_charger}/api/ocpp/charge-points/${params.chargePointId}/configuration/${params.key}`,
        JSON.stringify(params.value),
        configForAppJson
    );
}

// ocpp actions
export const $HTTP_clearCache = (params) => {
    return post(
        `${base_charger}/api/ocpp/charge-points/${params.chargePointId}/clear-cache`
    );
}

export const $HTTP_resetChargers = (params) => {
    return post(
        `${base_charger}/api/ocpp/charge-points/${params.chargePointId}/reset/${params.type}`
    );
};

export const $HTTP_unlockConnector = (params) => {
    return post(
        `${base_charger}/api/ocpp/charge-points/${params.chargePointId}/unlock`,params
    );
};

// transactions
export const $HTTP_getAllTransactionsReasonList = () => {
    return fetch(`${base_charger}/api/reports/transactions/reason-list`)
}

export const $HTTP_getAllTransactions = (params) => {
    return fetch(`${base_charger}/api/reports/transactions`, params)
}

export const $HTTP_startConnectorTransaction = (params) => {
    return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/transactions`,params);
}

export const $HTTP_stopConnectorTransaction = (params) => {
        return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/transactions/stop`,params);
}

// Id Tag apis
export const $HTTP_getIdTagsList = (params) => { return fetch(`${base_charger}/api/reports/id-tags`, params) }

export const $HTTP_getIdTagsListById = () => { return }

export const $HTTP_createIdTags = (params) => { return post(`${base_charger}/api/id-tags`, params) }

export const $HTTP_updateIdTags = (params) => { return put(`${base_charger}/api/id-tags/${params.id}`, params) }

export const $HTTP_deleteIdTags = (params) => { return del(`${base_charger}/api/id-tags/${params.id}`) }

// charge price apis
export const $HTTP_getPriceStatusList = (params) => { return fetch(`${base_charger}/api/reports/charge-prices`, params) }

export const $HTTP_addChargePrice = (params) => { return post(`${base_charger}/api/charge-prices`, params) }

export const $HTTP_updateChargePrice = (params) => { return put(`${base_charger}/api/charge-prices/${params.id}`, params) }

export const $HTTP_getRateTypeList = () => { return fetch(`${base_charger}/api/charge-prices/charge-rate-type-list`) }

export const $HTTP_getCurrencyList = () => { return fetch(`${base_charger}/api/charge-prices/currency-type-list`) }

export const $HTTP_deleteChargePrice = (params) => { return del(`${base_charger}/api/charge-prices/${params.chargePriceId}`, params) }

export const $HTTP_updateChargeBoxPrice = (params) => { return putWithConfig(`${base_charger}/api/charge-points/${params.chargePointId}/charge-price`, params.data, params.config) }

export const $HTTP_deleteChargeBoxPrice = (params) => { return del(`${base_charger}/api/charge-points/${params.chargePointId}/charge-price`) }

//logout
export const $HTTP_logout = (params) => { return post(`${base_auth}/auth/revoke`, qs.stringify(params)) }


// get status of the machines for filtering
export const $HTTP_getStatusListChargeStations = () => {
    return fetch(`${base_charger}/api/charge-stations/status-list`)
}

// get status of the chargeboxes for filtering
export const $HTTP_getStatusListChargeBoxes = () => {
    return fetch(`${base_charger}/api/reports/charge-points/status-list`)
}

//vehicles
export const $HTTP_getCarBrandListForSelect = params => { return fetch(`${base_vehicle}/api/vehicles/makes`, (params)) }

export const $HTTP_getCarModelListForSelect = params => { return fetch(`${base_vehicle}/api/vehicles/makes/${params.make}/models`, (params)) }

export const $HTTP_getCarInfo = params => {
    let carId = params.carId
    return fetch(`${base_vehicle}/api/vehicles/${carId}`)
}

export const $HTTP_addCars = params => {
    return post(`${base_vehicle}/api/vehicles`, params)
}

export const $HTTP_updateCars = params => {
    return patch(`${base_vehicle}/api/vehicles/${params.id}`, params)
}

// delete vehicle by id
export const $HTTP_deleteVehicle = params => {
    return del(`${base_vehicle}/api/vehicles/${params.id}`, params)
}

//get detailed vehicles
export const $HTTP_getCarList = params => { return fetch(`${base_vehicle}/api/vehicles/detailed`, (params)) }

//operators
export const $HTTP_getOperatorList = params => {
    return fetch(`${base_auth}/api/Users`, (params))
}

export const $HTTP_registerOperator = params => { return post(`${base_auth}/api/Users/register`, (params)) }

export const $HTTP_updateOperator = params => { return put(`${base_auth}/api/Users/${params.id}`, (params)) }

export const $HTTP_updateOperatorPassword = params => {
    return put(`${base_auth}/api/Users/${params.id}/password`, params)
}

export const $HTTP_deleteOperatorPassword = params => {
    return del(`${base_auth}/api/Users/${params.id}`)
}

export const $HTTP_addRoles = params => {
    let id = params.id;
    let roles = params.roles;
    return put(`${base_auth}/api/Users/${id}/roles`, roles)
}

// stations and charge boxes
export const $HTTP_getZipCodeListForSelect = () => {
    return fetch(`${base_charger}/api/reports/charge-stations/zip-codes`)
}

export const $HTTP_addStation = params => { return post(`${base_charger}/api/charge-stations`, params) }

export const $HTTP_updateStation = params => {
    return put(`${base_charger}/api/charge-stations/${params.stationId}`, params)
}

export const $HTTP_getIndividualStationData = params => { return fetch(`${base_charger}/api/charge-stations/${params}`) }

export const $HTTP_deleteStation = params => {
    return del(`${base_charger}/api/charge-stations/${params.stationId}`)
}

export const $HTTP_getStationList = params => {
    return fetch(`${base_charger}/api/reports/charge-stations`, params)
}

export const $HTTP_getStationListById = params => {
    return fetch(`${base_charger}/api/reports/charge-stations/${params.chargeStationId}`, params)
}

export const $HTTP_getStationInfo = params => {
    return fetch(`${base_charger}/api/reports/charge-stations/${params.stationId}`)
}

export const $HTTP_addChargeBox = params => { return post(`${base_charger}/api/charge-points`, params) }

export const $HTTP_updateChargeBox = params => { return put(`${base_charger}/api/charge-points/${params.id}`, params) }

export const $HTTP_deleteChargeBox = params => { return del(`${base_charger}/api/charge-points/${params.chargePointId}`) }

export const $HTTP_getChargeBoxListById = (params) => { return fetch(`${base_charger}/api/charge-stations/${params.stationId}/charge-points`) }

export const $HTTP_getAllChargeBoxList = (params) => { return fetch(`${base_charger}/api/reports/charge-points`, params) }

export const $HTTP_addBoundingToStation = (params) => {
    return putWithConfig(`${base_charger}/api/charge-points/${params.chargePointId}/charge-station`, params.stationId, params.config)
}

export const $HTTP_updateStatusStation = (params) => {
    return putWithConfig(`${base_charger}/api/charge-stations/${params.stationId}/status`, params.status, params.config)
}

export const $HTTP_removeBoundingToStation = (params) => {
    return del(`${base_charger}/api/charge-points/${params.chargePointId}/charge-station`)
}
//get connector type list
export const $HTTP_getConnectorTypeList = () => {
    return fetch(`${base_charger}/api/charge-points/connector-type-list`)
}

//update connector type
export const $HTTP_updateConnectorType = (params) => {
    return putWithConfig(`${base_charger}/api/charge-points/${params.chargePointId}/connectors/${params.connectorId}`, params.connectorType, params.config);
}

//get connector summary
export const $HTTP_getConnectorSummary = (params) => {
    return fetch(
        `${base_charger}/api/reports/charge-points/connector-summary`,params
    );
}

//get connector statuses
export const $HTTP_getConnectorStatusesById = (params) => {
    return fetch(`${base_charger}/api/reports/charge-points/${params.chargePointId}/connectors`)
}

//get transaction summary
export const $HTTP_getTransactionSummary = (params) => {
    return fetch(
        `${base_charger}/api/reports/charge-points/transaction-summary`,
        params
    );
}

export const $HTTP_getTransactionsStatistics = (params) => {
    return fetch (`${base_charger}/api/reports/transactions/statistics`,params)
}

//get connection Summary
export const $HTTP_getConnectionSummary = (params) => {
    return fetch(
        `${base_charger}/api/reports/charge-points/connection-summary`,
        params
    );
}

/**
 * @description reserve now
 */
export const $HTTP_reserveNow = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/reservations`, params) }

/**
 * @description get reservation
 */
export const $HTTP_getReservation = params => { return fetch(`${base_charger}/api/reports/reservations`, params) }

/**
 * @description cancel reservation
 */
export const $HTTP_cancelReservation = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/reservations/cancel`, params) }

/**
 * @description Send Trigger Message
 */
export const $HTTP_sendTriggerMessage = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/trigger-message`, params) }

//get id tag list
export const $HTTP_getIdtagList = () => { return fetch(`${base_charger}/api/ocpp/local-auth-list/idtag-list`) }

//get local auth list version
export const $HTTP_getLocalAuthListVersion = params => { return fetch(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/local-list/version`, {}) }

//send auth local list to charger
export const $HTTP_sendAuthLocalList = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/local-list`, params.param)}

//clear auth local list
export const $HTTP_deleteAuthLocalList = params => { return del(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/local-list`, params.param)}

//get diagnostics
export const $HTTP_postDiagnostics = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/get-diagnostics`, params.param) }

// polling get diagnostics status
export const $HTTP_getDiagnosticsStatus = params => { return fetch(`${base_charger}/api/charge-points/${params.chargePointId}/diagnostics-status`, {})}

//get diagnostics/firmware file list
export const $HTTP_getFileList = params => { return fetch(`${base_charger}/api/files/${params.category}/${params.chargePointId}`, params.param) }

//get Diagnostics Download File
export const $HTTP_getDownloadFile = params => { return fetch(`${base_charger}/api/files/${params.category}/${params.chargePointId}/${params.filename}`) }

// get charge point by id
export const $HTTP_getChargePointById = params => { return fetch(`${base_charger}/api/charge-points/${params.chargePointId}`) }

//charge Point update firmware
export const $HTTP_postUpdateFirmware = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/update-firmware`, params.param) }

//charge Point get update firmware status
export const $HTTP_getUpdateFirmwareStatus = params => { return fetch(`${base_charger}/api/charge-points/${params.chargePointId}/firmware-status`) }

//get charge point upload firmware file url
export const $HTTP_getFirmwareUploadUrl = params => { return fetch(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/upload-firmware`) }

// graph apis
export const $HTTP_getTransactionTrafficGraphData = params => { return fetch(`${base_charger}/api/reports/transactions/graphs/traffic`,params) }

//get charging rate uni
export const $HTTP_getChargingRateUnit = () => { return fetch(`${base_charger}/api/ocpp/chargingrateunit-type-list`) }

//get recurrency kind
export const $HTTP_getRecurrencyKind = () => { return fetch(`${base_charger}/api/ocpp/recurrencykind-type-list`) }

//get charging profiles
export const $HTTP_getChargingProfilesTemplate = params => { return fetch(`${base_charger}/api/reports/charging-profiles/templates`, params) }
export const $HTTP_getChargingProfilesRecord = params => { return fetch(`${base_charger}/api/reports/charging-profiles/records`, params) }

//add charging profile
export const $HTTP_addChargingProfile = params => { return post(`${base_charger}/api/charging-profiles/templates`, params) }

//update charging profile
export const $HTTP_updateChargingProfile = params => { return put(`${base_charger}/api/charging-profiles/templates/${params.id}`, params) }

//delete charging profile
export const $HTTP_delChargingProfile = params => { return del(`${base_charger}/api/charging-profiles/templates/${params.chargingProfileId}`) }

//set charging profile
export const $HTTP_setChargingProfile = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/charging-profiles`, params) }

//clear charging profile
export const $HTTP_clearChargingProfile = params => { return post(`${base_charger}/api/ocpp/charge-points/${params.chargePointId}/charging-profiles/clear`, params) }

