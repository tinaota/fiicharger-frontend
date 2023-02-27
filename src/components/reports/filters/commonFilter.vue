<template>
    <div style="width:100%">
        <el-select class="select-small componentSelectDropdown" v-model="filter.dropdownSelected" :placeholder="$t('general.select')" @change="updateDropdownSelected">
            <el-option v-for="item in filter.dropdownList" :label="$t(`reports.${item}`)" :key="item" :value="item"></el-option>
        </el-select>
        <el-input v-if="addressFilter" :placeholder="$t('general.address')" v-model="filter.address" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="zipCodeFilter" :placeholder="$t('general.zipCode')" v-model="filter.zipCode" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="regularIdFilter" placeholder="ID" v-model="filter.regularId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-select v-if="parentIdTagIdFilter" class="select-small" v-model="filter.parentIdTagId" :placeholder="$t('idTags.parentIdTagId')" v-loading="filter.parentIdTagIdList.isLoading" @change="updateParams" clearable>
            <el-option v-for="item in filter.parentIdTagIdList.data" :label="item.value" :key="item.value" :value="item.id"></el-option>
        </el-select>
        <!-- ocpp id -->
        <el-input v-if="chargePointIdFilter" :placeholder="$t('chargingStation.charger')+ ' ID'" v-model="filter.chargePointId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="chargePointNameFilter" :placeholder="$t('chargingStation.chargePointName')" v-model="filter.chargePointName" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <!-- uses text station name filter -->
        <el-input v-if="nameFilter" :placeholder="getNamePlaceHolder" v-model="filter.name" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <!-- uses station id for filter, show station name -->
        <el-select v-if="stationIdFilter" class="select-small" v-model="filter.stationId" :placeholder="$t('chargingStation.stationName')" v-loading="filter.stationList.isLoading" @change="updateParams" clearable>
            <el-option v-for="item in filter.stationList.data" :label="item.name" :key="item.value" :value="item.id"></el-option>
        </el-select>
        <el-select v-if="isBoundToStationFilter" class="select-small" v-model="filter.isBoundToStation" :placeholder="$t('general.boundToStation')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="reservationStatusFilter" class="select-small" v-model="filter.reservationStatus" :placeholder="$t('general.status')" @change="updateParams" clearable>
            <el-option v-for="item in filter.reservationStatusList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="connectionStatusFilter" class="select-small" v-model="filter.connectionStatus" :placeholder="$t('chargingStation.connectionStatus')" @change="updateParams" clearable>
            <el-option v-for="item in filter.connectionStatusList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="stationStatusFilter" class="select-small" v-model="filter.stationStatus" :placeholder="$t('chargingStation.stationStatus')" @change="updateParams" clearable>
            <el-option v-for="item in filter.stationStatusList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="powerTypeFilter" class="select-small" v-model="filter.powerType" :placeholder="$t('general.powerType')" @change="updateParams" clearable>
            <el-option v-for="item in filter.powerTypeList" :label="item.name" :key="item.value" :value="item.value"></el-option>
        </el-select>
        <el-select v-if="connectorTypeFilter" class="select-small" :placeholder="$t('general.connectorType')" v-model="filter.connectorType" @change="updateParams" clearable>
            <el-option v-for="item in filter.connectorTypeList" :label="item.name" :key="item.value" :value="item.value"></el-option>
        </el-select>
        <el-input v-if="connectorIdFilter" :placeholder="$t('chargingStation.connectorId')" v-model="filter.connectorId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="startIdTagFilter" :placeholder="$t('chargingStation.startIdTag')" v-model="filter.startIdTag" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="stopIdTagFilter" :placeholder="$t('chargingStation.stopIdTag')" v-model="filter.stopIdTag" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="stopReasonFilter" :placeholder="$t('chargingStation.stopReason')" v-model="filter.stopReason" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-select v-if="chargingProfilePurposeFilter" class="select-small" v-model="filter.chargingProfilePurpose" :placeholder="$t('chargingProfile.chargingProfilePurpose')" @change="updateParams" clearable>
            <el-option v-for="item in filter.chargingProfilePurposeList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="isActiveFilter" class="select-small" v-model="filter.isActive" :placeholder="$t('general.active')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="isExpiredFilter" class="select-small" v-model="filter.isExpired" :placeholder="$t('idTags.expired')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="isBlockedFilter" class="select-small" v-model="filter.isBlocked" :placeholder="$t('idTags.blocked')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-input v-if="keyWordFilter" :placeholder="$t('general.keyWord')" v-model="filter.keyWord" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-date-picker v-if="dateRangeFilter" :default-time="['00:00:00', '23:59:59']" v-model="filter.dateRange" type="daterange" format="MMM dd yyyy" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="filter.pickerOptions" :clearable="false" class="" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="startDateTimeAfterFilter" class="single-date-picker" v-model="filter.startDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.startDateTimeAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="startDateTimeBeforeFilter" class="single-date-picker" v-model="filter.startDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.startDateTimeBefore')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="endDateTimeAfterFilter" class="single-date-picker" v-model="filter.endDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.endDateTimeAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="endDateTimeBeforeFilter" class="single-date-picker" v-model="filter.endDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.endDateTimeBefore')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="createdAfterFilter" class="single-date-picker" v-model="filter.createdAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.createdAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="createdBeforeFilter" class="single-date-picker" v-model="filter.createdBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.createdBefore')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="expiresAfterFilter" class="single-date-picker" v-model="filter.expiresAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.expiresAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="expiresBeforeFilter" class="single-date-picker" v-model="filter.expiresBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :clearable="true" :placeholder="$t('general.expiresBefore')" @change="updateParams">
        </el-date-picker>
    </div>
</template>

<script>
import moment from "moment";
import { $GLOBAL_PAGE_LIMIT, $POWER_TYPE_LIST, $CONNECTOR_TYPE_LIST } from "@/utils/global";
import { $HTTP_getIdTagsList, $HTTP_getStationList } from "@/api/api";
export default {
    emits: ["updateDropdown", "updateParams"],
    data() {
        return {
            filter: {
                dropdownSelected: "chargePoints",
                dropdownList: [
                    "chargePoints",
                    // "chargePointsConnectorSummary",
                    // "chargePointsTransactionSummary",
                    "chargePointUsage",
                    // "chargeStations",
                    "chargeStationSummary",
                    "chargeStationOverallSummary",
                    // "chargingProfileTemplates",
                    "chargingProfiles",
                    "idTags",
                    "reservations",
                    "transactions"
                ],
                isBoundToStation: null,
                chargePointName: "",
                regularId: "",
                chargePointId: "",
                connectorId: "",
                name: "",
                stationId: "",
                zipCode: "",
                keyWord: "",
                connectorType: "",
                address: "",
                booleanList: ["true", "false"],
                dateRange: [],
                pickerOptions: {
                    disabledDate(time) {
                        let today = moment().endOf("day").format("x");
                        return time.getTime() > today;
                    }
                },
                parentIdTagIdList: {
                    data: [],
                    isLoading: false
                },
                stationList: {
                    data: [],
                    isLoading: false
                },
                limit: $GLOBAL_PAGE_LIMIT,
                connectionStatus: "",
                connectionStatusList: ["Connected", "Disconnected"],
                stationStatus: "",
                stationStatusList: ["Enabled", "Disabled"],
                powerType: "",
                powerTypeList: $POWER_TYPE_LIST,
                connectorTypeList: $CONNECTOR_TYPE_LIST,
                startIdTag: "",
                stopIdTag: "",
                stopReason: "",
                isActive: null,
                isExpired: null,
                isBlocked: null,
                parentIdTagId: "",
                startDateTimeAfter: null,
                startDateTimeBefore: null,
                endDateTimeAfter: null,
                endDateTimeBefore: null,
                createdAfter: null,
                createdBefore: null,
                expiresAfter: null,
                expiresBefore: null,
                reservationStatus: "",
                reservationStatusList: ["Accepted", "Faulted", "Occupied", "Rejected", "Unavailable"],
                chargingProfilePurpose: "",
                chargingProfilePurposeList: ["ChargePointMaxProfile", "TxDefaultProfile", "TxProfile"]
            }
        };
    },
    computed: {
        getNamePlaceHolder() {
            if (this.filter.dropdownSelected === "chargingProfiles") {
                return i18n.t("general.name");
            } else {
                return i18n.t("chargingStation.stationName");
            }
        },
        addressFilter() {
            return this.filter.dropdownSelected === "chargeStationSummary" || this.filter.dropdownSelected === "chargeStationOverallSummary";
        },
        zipCodeFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage" ||
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        regularIdFilter() {
            return this.filter.dropdownSelected === "idTags";
        },
        chargePointIdFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage" ||
                this.filter.dropdownSelected === "transactions" ||
                this.filter.dropdownSelected === "reservations" ||
                this.filter.dropdownSelected === "chargingProfiles"
            );
        },
        connectorIdFilter() {
            return (
                this.filter.dropdownSelected === "transactions" ||
                this.filter.dropdownSelected === "reservations" ||
                this.filter.dropdownSelected === "chargingProfiles"
            );
        },
        chargePointNameFilter() {
            return this.filter.dropdownSelected === "chargePoints" || this.filter.dropdownSelected === "chargePointUsage";
        },
        nameFilter() {
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary" ||
                this.filter.dropdownSelected === "chargingProfiles"
            );
        },
        stationIdFilter() {
            return this.filter.dropdownSelected === "chargePoints" || this.filter.dropdownSelected === "chargePointUsage";
        },
        isBoundToStationFilter() {
            return this.filter.dropdownSelected === "chargePoints" || this.filter.dropdownSelected === "chargePointUsage";
        },
        reservationStatusFilter() {
            return this.filter.dropdownSelected === "reservations";
        },
        connectionStatusFilter() {
            return this.filter.dropdownSelected === "chargePoints" || this.filter.dropdownSelected === "chargePointUsage";
        },
        stationStatusFilter() {
            return this.filter.dropdownSelected === "chargeStationSummary" || this.filter.dropdownSelected === "chargeStationOverallSummary";
        },
        powerTypeFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage" ||
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        connectorTypeFilter() {
            return this.filter.dropdownSelected === "chargeStationSummary" || this.filter.dropdownSelected === "chargeStationOverallSummary";
        },
        keyWordFilter() {
            return this.filter.dropdownSelected === "chargeStationSummary" || this.filter.dropdownSelected === "chargeStationOverallSummary";
        },
        startIdTagFilter() {
            return this.filter.dropdownSelected === "transactions" || this.filter.dropdownSelected === "reservations";
        },
        stopIdTagFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        stopReasonFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        chargingProfilePurposeFilter() {
            return this.filter.dropdownSelected === "chargingProfiles";
        },
        isActiveFilter() {
            return (
                this.filter.dropdownSelected === "transactions" ||
                this.filter.dropdownSelected === "reservations" ||
                this.filter.dropdownSelected === "chargingProfiles"
            );
        },
        isExpiredFilter() {
            return this.filter.dropdownSelected === "idTags";
        },
        isBlockedFilter() {
            return this.filter.dropdownSelected === "idTags";
        },
        parentIdTagIdFilter() {
            return this.filter.dropdownSelected === "idTags";
        },
        startDateTimeBeforeFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        startDateTimeAfterFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        endDateTimeAfterFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        endDateTimeBeforeFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        createdAfterFilter() {
            return this.filter.dropdownSelected === "reservations";
        },
        createdBeforeFilter() {
            return this.filter.dropdownSelected === "reservations";
        },
        expiresAfterFilter() {
            return this.filter.dropdownSelected === "reservations";
        },
        expiresBeforeFilter() {
            return this.filter.dropdownSelected === "reservations";
        },
        dateRangeFilter() {
            return (
                this.filter.dropdownSelected === "chargePointUsage" ||
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        filter: function () {
            this.getFiltersList();
        },
        selectedOrganization: function () {
            this.getFiltersList();
        }
    },
    mounted() {
        // add dates
        this.mountDefaultDateRange();
        this.updateDropdownSelected();
        // update all default params after mounting everything
        this.updateParams();
    },
    methods: {
        getFiltersList() {
            // get id tag filters
            if (this.filter.dropdownSelected === "idTags") {
                this.getParentIdTagList();
            }
            // get station id filters
            if (this.filter.dropdownSelected === "chargePoints" || this.filter.dropdownSelected === "chargePointUsage") {
                this.getStationList();
            }
        },
        getParentIdTagList() {
            this.filter.parentIdTagIdList.isLoading = true;
            let params = {
                page: 1,
                limit: this.limit
            };
            $HTTP_getIdTagsList(params)
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.filter.parentIdTagIdList.data = res.data;
                        this.filter.parentIdTagIdList.isLoading = false;
                    }
                })
                .catch((err) => {
                    this.filter.parentIdTagIdList.isLoading = false;
                    let errorMessage = catchErrors("idTagListError", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        getStationList() {
            let params = {
                page: 1,
                limit: this.limit
            };
            this.filter.stationList.isLoading = true;
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            $HTTP_getStationList(params)
                .then((res) => {
                    this.filter.stationList.isLoading = false;
                    if (res.data.length > 0) {
                        this.filter.stationList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.filter.stationList.isLoading = false;
                    let errorMessage = catchErrors("idTagListError", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        mountDefaultDateRange() {
            // add dates
            const startOfDay = moment().subtract(6, "days").startOf("day");
            const endOfDay = moment().endOf("day");
            this.filter.dateRange = [new Date(startOfDay), new Date(endOfDay)];
        },
        updateDropdownSelected() {
            // set to default value on dropdown change
            this.filter = {
                ...this.filter,
                isBoundToStation: null,
                chargePointName: "",
                regularId: "",
                chargePointId: "",
                connectorId: "",
                name: "",
                stationId: "",
                zipCode: "",
                keyWord: "",
                connectorType: "",
                address: "",
                connectionStatus: "",
                powerType: "",
                stationStatus: "",
                startIdTag: "",
                stopIdTag: "",
                stopReason: "",
                isActive: null,
                isExpired: null,
                isBlocked: null,
                parentIdTagId: "",
                startDateTimeAfter: null,
                startDateTimeBefore: null,
                endDateTimeAfter: null,
                endDateTimeBefore: null,
                createdAfter: null,
                createdBefore: null,
                expiresAfter: null,
                expiresBefore: null,
                reservationStatus: "",
                chargingProfilePurpose: ""
            };
            // set default dates
            this.mountDefaultDateRange();
            this.$emit("updateDropdown", this.filter.dropdownSelected);
            // update all default params after mounting new component
            this.updateParams();
        },
        updateParams() {
            // send params to the overview page when button is clicked
            let params = {};
            if (this.filter.address) {
                params.Address = this.filter.address;
            }
            if (this.filter.isBoundToStation) {
                params.IsBoundToStation = this.filter.isBoundToStation === "true";
            }
            if (this.filter.chargePointName) {
                params.Name = this.filter.chargePointName;
            }

            if (this.filter.regularId) {
                if (this.filter.dropdownSelected === "idTags") {
                    params.Value = this.filter.regularId;
                }
            }
            if (this.filter.chargePointId) {
                if (
                    this.filter.dropdownSelected === "transactions" ||
                    this.filter.dropdownSelected === "chargePoints" ||
                    this.filter.dropdownSelected === "chargePointUsage" ||
                    this.filter.dropdownSelected === "chargingProfiles"
                ) {
                    params.OcppId = this.filter.chargePointId;
                } else {
                    params.Id = this.filter.chargePointId;
                }
            }

            if (this.filter.connectorId) {
                if (this.filter.dropdownSelected === "transactions" || this.filter.dropdownSelected === "chargingProfiles") {
                    params.ConnectorId = this.filter.connectorId;
                }
            }
            if (this.filter.name) {
                if (
                    this.filter.dropdownSelected === "chargeStationSummary" ||
                    this.filter.dropdownSelected === "chargeStationOverallSummary" ||
                    this.filter.dropdownSelected === "chargingProfiles"
                ) {
                    params.Name = this.filter.name;
                }
            }
            if (this.filter.stationId) {
                params.StationId = this.filter.stationId;
            }
            if (this.filter.zipCode) {
                params.ZipCode = this.filter.zipCode;
            }
            if (this.filter.reservationStatus) {
                params.Status = this.filter.reservationStatus;
            }
            if (this.filter.stationStatus) {
                params.Publish = this.filter.stationStatus === "Enabled";
            }
            if (this.filter.connectionStatus) {
                params.Status = this.filter.connectionStatus;
            }
            if (this.filter.powerType && this.filter.powerType !== "all") {
                params.PowerType = this.filter.powerType;
            }
            if (this.filter.connectorType) {
                params.ConnectorType = this.filter.connectorType;
            }
            if (this.filter.keyWord) {
                params.Keyword = this.filter.keyWord;
            }
            if (this.filter.startIdTag) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StartIdTag = this.filter.startIdTag;
                } else if (this.filter.dropdownSelected === "reservations") {
                    params.IdTag = this.filter.startIdTag;
                }
            }
            if (this.filter.stopIdTag) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StopIdTag = this.filter.stopIdTag;
                }
            }
            if (this.filter.stopReason) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StopReason = this.filter.stopReason;
                }
            }
            if (this.filter.chargingProfilePurpose) {
                if (this.filter.dropdownSelected === "chargingProfiles") {
                    params.ChargingProfilePurpose = this.filter.chargingProfilePurpose;
                }
            }
            if (this.filter.isActive) {
                if (
                    this.filter.dropdownSelected === "transactions" ||
                    this.filter.dropdownSelected === "reservations" ||
                    this.filter.dropdownSelected === "chargingProfiles"
                ) {
                    params.IsActive = this.filter.isActive === "true";
                }
            }
            if (this.filter.isExpired) {
                params.IsExpired = this.filter.isExpired === "true";
            }
            if (this.filter.isBlocked) {
                params.IsBlocked = this.filter.isBlocked === "true";
            }
            if (this.filter.parentIdTagId) {
                if (this.filter.dropdownSelected === "idTags") {
                    params.ParentIdTagId = this.filter.parentIdTagId;
                }
            }
            if (this.filter.dateRange) {
                if (
                    this.filter.dropdownSelected === "chargePointUsage" ||
                    this.filter.dropdownSelected === "chargeStationSummary" ||
                    this.filter.dropdownSelected === "chargeStationOverallSummary"
                ) {
                    params.Before = this.filter.dateRange[1];
                    params.After = this.filter.dateRange[0];
                }
            }

            if (this.filter.startDateTimeAfter) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StartedAfter = this.filter.startDateTimeAfter;
                }
            }
            if (this.filter.startDateTimeBefore) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StartedBefore = this.filter.startDateTimeBefore;
                }
            }
            if (this.filter.endDateTimeAfter) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StoppedAfter = this.filter.endDateTimeAfter;
                }
            }
            if (this.filter.endDateTimeBefore) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.StoppedBefore = this.filter.endDateTimeBefore;
                }
            }
            if (this.filter.createdAfter) {
                if (this.filter.dropdownSelected === "reservations") {
                    params.CreatedAfter = this.filter.createdAfter;
                }
            }
            if (this.filter.createdBefore) {
                if (this.filter.dropdownSelected === "reservations") {
                    params.CreatedBefore = this.filter.createdBefore;
                }
            }
            if (this.filter.expiresBefore) {
                if (this.filter.dropdownSelected === "reservations") {
                    params.ExpiresBefore = this.filter.expiresBefore;
                }
            }
            if (this.filter.expiresAfter) {
                if (this.filter.dropdownSelected === "reservations") {
                    params.ExpiresAfter = this.filter.expiresAfter;
                }
            }
            this.$emit("updateParams", params);
        }
    }
};
</script>

<style lang="scss" scoped>
.componentSelectDropdown,
div + div {
    margin-left: 5px;
}
</style>
