<template>
    <div style="width:100%">
        <el-select class="select-small compnentSelectDropdown" v-model="filter.dropdownSelected" :placeholder="$t('general.select')" @change="updateDropdownSelected">
            <el-option v-for="item in filter.dropdownList" :label="$t(`reports.${item}`)" :key="item" :value="item"></el-option>
        </el-select>
        <el-input v-if="zipCodeFilter" :placeholder="$t('general.location')" v-model="filter.zipCode" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="chargePointIdFilter" :placeholder="$t('chargingStation.charger')+ ' ID'" v-model="filter.chargePointId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="chargePointNameFilter" :placeholder="$t('chargingStation.chargePointName')" v-model="filter.chargePointName" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-input v-if="stationIdFilter" :placeholder="$t('chargingStation.stationID')" v-model="filter.stationId" @change="updateParams" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-select v-if="isBoundToStationFilter" class="select-small" v-model="filter.isBoundToStation" :placeholder="$t('general.boundToStation')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <!-- <el-select v-if="isDescendingFilter" class="select-small" v-model="filter.isDescending" :placeholder="$t('general.descending')" @change="updateParams" clearable>
            <el-option v-for="item in filter.booleanList" :label="item" :key="item" :value="item"></el-option>
        </el-select> -->
        <el-select v-if="connectionStatusFilter" class="select-small" v-model="filter.connectionStatus" :placeholder="$t('chargingStation.connectionStatus')" @change="updateParams" clearable>
            <el-option v-for="item in filter.connectionStatusList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-select v-if="currentTypeFilter" class="select-small" v-model="filter.currentType" :placeholder="$t('general.type')" @change="updateParams" clearable>
            <el-option v-for="item in filter.currentTypeList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <el-date-picker v-if="dateRangeFilter" :default-time="['00:00:00', '23:59:59']" v-model="filter.dateRange" type="daterange" format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="filter.pickerOptions" :clearable="false" class="" @change="updateParams">
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
                dropdownSelected: "chargePointUsage",
                dropdownList: [
                    "chargePoints",
                    // "chargePointsConnectorSummary",
                    // "chargePointsTransactionSummary",
                    "chargePointUsage"
                    // "chargeStations",
                    // "chargeStationSummary",
                    // "chargeStationOverallSummary",
                    // "chargingProfileTemplates",
                    // "chargingProfiles",
                    // "idTags",
                    // "reservations",
                    // "transactions"
                ],
                isBoundToStation: null,
                isDescending: null,
                chargePointName: "",
                chargePointId: "",
                stationId: "",
                zipCode: "",
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
                currentType: "",
                currentTypeList: ["AC", "DC"]
            }
        };
    },
    computed: {
        zipCodeFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        chargePointIdFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        chargePointNameFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
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
        isDescendingFilter() {
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
        currentTypeFilter() {
            return (
                this.filter.dropdownSelected === "chargePoints" ||
                this.filter.dropdownSelected === "chargePointUsage"
            );
        },
        dateRangeFilter() {
            return this.filter.dropdownSelected === "chargePointUsage";
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
                isDescending: null,
                chargePointName: "",
                chargePointId: "",
                stationId: "",
                zipCode: "",
                connectionStatus: "",
                currentType: ""
            };
            // set default dates
            this.mountDefaultDateRange();
            this.$emit("updateDropdown", this.filter.dropdownSelected);
        },
        updateParams() {
            // send params to the overview page when button is clicked
            let params = {};
            if (this.filter.isBoundToStation) {
                params.IsBoundToStation =
                    this.filter.isBoundToStation === "true";
            }
            if (this.filter.isDescending) {
                params.IsDescending = this.filter.isDescending === "true";
            }
            if (this.filter.chargePointName) {
                params.Name = this.filter.chargePointName;
            }
            if (this.filter.chargePointId) {
                params.Id = this.filter.chargePointId;
            }
            if (this.filter.stationId) {
                params.StationId = this.filter.stationId;
            }
            if (this.filter.zipCode) {
                params.ZipCode = this.filter.zipCode;
            }
            if (this.filter.connectionStatus) {
                params.Status = this.filter.connectionStatus;
            }
            if (this.filter.currentType) {
                params.CurrentType = this.filter.currentType;
            }
            if (this.filter.dateRange) {
                if (this.filter.dropdownSelected === "chargePointUsage") {
                    params.Before = this.filter.dateRange[1];
                    params.After = this.filter.dateRange[0];
                }
            }
            this.$emit("updateParams", params);
        }
    }
};
</script>

<style lang="scss" scoped>
.compnentSelectDropdown,
div + div {
    margin-left: 5px;
}
</style>
