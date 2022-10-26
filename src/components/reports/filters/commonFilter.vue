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
        <!-- removed station id filter as it requires a complete uuid for filtration -->
        <!-- <el-input v-if="parentIdTagIdFilter" :placeholder="$t('idTags.parentIdTagId')" v-model="filter.parentIdTagId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input> -->
        <el-input v-if="chargePointIdFilter" :placeholder="$t('chargingStation.charger')+ ' ID'" v-model="filter.chargePointId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="chargePointNameFilter" :placeholder="$t('chargingStation.chargePointName')" v-model="filter.chargePointName" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="stationNameFilter" :placeholder="$t('chargingStation.stationName')" v-model="filter.stationName" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <!-- removed station id filter as it requires a complete uuid for filtration -->
        <!-- <el-input v-if="stationIdFilter" :placeholder="$t('chargingStation.stationID')" v-model="filter.stationId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input> -->
        <el-select v-if="isBoundToStationFilter" class="select-small" v-model="filter.isBoundToStation" :placeholder="$t('general.boundToStation')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
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
        <el-date-picker v-if="dateRangeFilter" :default-time="['00:00:00', '23:59:59']" v-model="filter.dateRange" type="daterange" format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="filter.pickerOptions" :clearable="false" class="" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="startDateTimeAfterFilter" class="single-date-picker" v-model="filter.startDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.startDateTimeAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="startDateTimeBeforeFilter" class="single-date-picker" v-model="filter.startDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.startDateTimeBefore')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="endDateTimeAfterFilter" class="single-date-picker" v-model="filter.endDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.endDateTimeAfter')" @change="updateParams">
        </el-date-picker>
        <el-date-picker v-if="endDateTimeBeforeFilter" class="single-date-picker" v-model="filter.endDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.endDateTimeBefore')" @change="updateParams">
        </el-date-picker>
    </div>
</template>

<script>
import moment from "moment";

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
                    // "chargingProfiles",
                    "idTags",
                    // "reservations",
                    "transactions"
                ],
                isBoundToStation: null,
                chargePointName: "",
                regularId: "",
                chargePointId: "",
                connectorId: "",
                stationName: "",
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
                connectionStatus: "",
                connectionStatusList: ["Connected", "Disconnected"],
                stationStatus: "",
                stationStatusList: ["Enabled", "Disabled"],
                powerType: "",
                powerTypeList: [
                    { name: "All", value: "all" },
                    { name: "AC single phase", value: "AC_1_PHASE" },
                    { name: "AC two phases", value: "AC_2_PHASE" },
                    {
                        name: "AC two phases w/ split phase",
                        value: "AC_2_PHASE_SPLIT"
                    },
                    { name: "AC three phases", value: "AC_3_PHASE" },
                    { name: "DC", value: "DC" }
                ],
                connectorTypeList: [
                    { name: "CHAdeMO, DC", value: "CHADEMO" },
                    { name: "ChaoJi", value: "CHAOJI" },
                    { name: "Type A, NEMA 1-15, 2 pins", value: "DOMESTIC_A" },
                    { name: "Type B, NEMA 5-15, 3 pins", value: "DOMESTIC_B" },
                    { name: "Type C, CEE 7/17, 2 pins", value: "DOMESTIC_C" },
                    { name: "Type D, 3 pins", value: "DOMESTIC_D" },
                    { name: "Type E, CEE 7/5, 3 pins", value: "DOMESTIC_E" },
                    {
                        name: "Type F, CEE 7/4, Schuko, 3 pin)",
                        value: "DOMESTIC_F"
                    },
                    {
                        name: "Type G, BS 1363, Commonwealth, 3 pins",
                        value: "DOMESTIC_G"
                    },
                    { name: "Type H, SI-32, 3 pins", value: "DOMESTIC_H" },
                    { name: "Type I, AS 3112, 3 pins", value: "DOMESTIC_I" },
                    { name: "Type J, SEV 1011, 3 pins", value: "DOMESTIC_J" },
                    {
                        name: "Type K, DS 60884-2-D1, 3 pins",
                        value: "DOMESTIC_K"
                    },
                    {
                        name: "Type L, CEI 23-16-VII, 3 pins",
                        value: "DOMESTIC_L"
                    },
                    { name: "Type M, BS 546, 3 pins", value: "DOMESTIC_M" },
                    { name: "Type N, NBR 14136, 3 pins", value: "DOMESTIC_N" },
                    {
                        name: "Type O, TIS 166-2549, 3 pins",
                        value: "DOMESTIC_O"
                    },
                    { name: "Guobiao GB/T 20234.2 AC", value: "GBT_AC" },
                    { name: "Guobiao GB/T 20234.3 DC", value: "GBT_DC" },
                    {
                        name: "IEC 60309-2 16A single phase",
                        value: "IEC_60309_2_single_16"
                    },
                    {
                        name: "IEC 60309-2 16A three phase",
                        value: "IEC_60309_2_three_16"
                    },
                    {
                        name: "IEC 60309-2 32A three phase",
                        value: "IEC_60309_2_three_32"
                    },
                    {
                        name: "IEC 60309-2 64A three phase",
                        value: "IEC_60309_2_three_64"
                    },
                    { name: "Type 1, SAE J1772)", value: "IEC_62196_T1" },
                    { name: "Type 1 combo, DC", value: "IEC_62196_T1_COMBO" },
                    { name: "Type 2, Mennekes", value: "IEC_62196_T2" },
                    { name: "Type 2 combo, DC", value: "IEC_62196_T2_COMBO" },
                    { name: "Type 3A", value: "IEC_62196_T3A" },
                    { name: "Type 3C, Scame", value: "IEC_62196_T3C" },
                    { name: "NEMA 5-20, 3 pins", value: "NEMA_5_20" },
                    { name: "NEMA 6-30, 3 pins", value: "NEMA_6_30" },
                    { name: "NEMA 6-50, 3 pins", value: "NEMA_6_50" },
                    { name: "NEMA 10-30, 3 pins", value: "NEMA_10_30" },
                    { name: "NEMA 10-50, 3 pins", value: "NEMA_10_50" },
                    { name: "NEMA 14-30, 3 pins", value: "NEMA_14_30" },
                    { name: "NEMA 14-50, 3 pins", value: "NEMA_14_50" },
                    {
                        name: "On-board bottom-up pantograph",
                        value: "PANTOGRAPH_BOTTOM_UP"
                    },
                    {
                        name: "Off-board top-down pantograph",
                        value: "PANTOGRAPH_TOP_DOWN"
                    },
                    {
                        name: "Tesla Roadster-type, round, 4 pins",
                        value: "TESLA_R"
                    },
                    {
                        name: "Tesla Model-S-type, oval, 5 pins",
                        value: "TESLA_S"
                    }
                ],
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
                endDateTimeBefore: null
            }
        };
    },
    computed: {
        addressFilter() {
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
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
                this.filter.dropdownSelected === "transactions"
            );
        },
        connectorIdFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        chargePointNameFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        stationNameFilter() {
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        stationIdFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        isBoundToStationFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        connectionStatusFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        stationStatusFilter() {
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
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
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        keyWordFilter() {
            return (
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
        },
        startIdTagFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        stopIdTagFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        stopReasonFilter() {
            return this.filter.dropdownSelected === "transactions";
        },
        isActiveFilter() {
            return this.filter.dropdownSelected === "transactions";
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
        dateRangeFilter() {
            return (
                this.filter.dropdownSelected === "chargePointUsage" ||
                this.filter.dropdownSelected === "chargeStationSummary" ||
                this.filter.dropdownSelected === "chargeStationOverallSummary"
            );
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
                stationName: "",
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
                endDateTimeBefore: null
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
                params.IsBoundToStation =
                    this.filter.isBoundToStation === "true";
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
                if (this.filter.dropdownSelected === "transactions") {
                    params.OcppId = this.filter.chargePointId;
                } else if (
                    this.filter.dropdownSelected === "chargePoints" ||
                    this.filter.dropdownSelected === "chargePointUsage"
                ) {
                    params.OcppId = this.filter.chargePointId;
                } else {
                    params.Id = this.filter.chargePointId;
                }
            }

            if (this.filter.connectorId) {
                if (this.filter.dropdownSelected === "transactions") {
                    params.ConnectorId = this.filter.connectorId;
                }
            }
            if (this.filter.stationName) {
                if (
                    this.filter.dropdownSelected === "chargeStationSummary" ||
                    this.filter.dropdownSelected ===
                        "chargeStationOverallSummary"
                ) {
                    params.Name = this.filter.stationName;
                }
            }
            if (this.filter.stationId) {
                params.StationId = this.filter.stationId;
            }
            if (this.filter.zipCode) {
                params.ZipCode = this.filter.zipCode;
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
            if (this.filter.isActive) {
                if (this.filter.dropdownSelected === "transactions") {
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
                    this.filter.dropdownSelected ===
                        "chargeStationOverallSummary"
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
