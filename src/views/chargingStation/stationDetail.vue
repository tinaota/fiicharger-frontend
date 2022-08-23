'<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/station' }">{{ $t('menu.station') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="card-alt">
                <div class="card-8 rank-area">
                    <div class="header">
                        <div class="title">{{ $t('chargingStation.stationInfo') }} </div>
                    </div>
                    <ul class="rank">
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.stationID') }}</span>
                                <span class="num">{{ stationInfo.stationId }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.stationName') }}</span>
                                <span class="num">{{ stationInfo.stationName }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('general.address') }}</span>
                                <span class="num">{{ stationInfo.address }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('general.zipCode') }}</span>
                                <span class="num">{{ stationInfo.zipCode }}</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="card-8 rank-area">
                    <div class="header">
                        <div class="title">{{ $t('general.action') }}</div>
                    </div>
                    <ul class="rank">
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.updateChargers') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction( 'run')">{{ $t('general.run') }}</el-button>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.diagnostics') }}</span>
                                <el-button type="primary" class="actionFunction " @click="runAction( 'start')">{{ $t('general.start') }}</el-button>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.addChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction( 'add')">{{ $t('general.add') }}</el-button>
                            </div>
                        </li>
                        <li>
                            <div class="label">
                                <span class="name">{{ $t('chargingStation.clearChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction( 'clear')">{{ $t('general.clear') }}</el-button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="card-8 rank-area">
                    <div class="header">
                        <div class="title">{{ $t('chargingStation.connectors') }}</div>
                        <div class="title-value">{{ getTotal(connectorSummary) }}</div>
                    </div>
                    <ul class="rank">
                        <li>
                            <div class="connectors">
                                <el-tooltip :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                                    <span class="circle-status color1"></span>
                                </el-tooltip>
                                <span class="name">{{ connectorSummary.available }} {{ $t('chargingStation.connector').toLowerCase() }} {{ lang==='en'? 's' : '' }} {{ $t('general.available').toLowerCase() }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="connectors">
                                <el-tooltip :content="$t('general.inUse')" placement="bottom" effect="light" popper-class="custom">
                                    <span class="circle-status color8"></span>
                                </el-tooltip>
                                <span class="name">{{ connectorSummary.inUse }} {{ $t('chargingStation.connector').toLowerCase() }}{{ lang==='en'? 's' : '' }} {{ $t('general.inUse').toLowerCase() }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="connectors">
                                <el-tooltip :content="$t('general.unavailable')" placement="bottom" effect="light" popper-class="custom">
                                    <span class="circle-status color4"></span>
                                </el-tooltip>
                                <span class="name">{{ connectorSummary.unavailable }} {{ $t('chargingStation.connector').toLowerCase() }}{{ lang==='en'? 's' : '' }} {{ $t('general.unavailable').toLowerCase() }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="connectors">
                                <el-tooltip content="offline" placement="bottom" effect="light" popper-class="custom">
                                    <span class="circle-status color10"></span>
                                </el-tooltip>
                                <span class="name">{{ connectorSummary.offline }} {{ $t('chargingStation.connector').toLowerCase() }}{{ lang==='en'? 's' : '' }} {{ $t('general.offline').toLowerCase() }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="graph_time">
                {{ $t('menu.statistics') }}
                <span>
                    <el-date-picker :default-time="['00:00:00', '23:59:59']" v-model="dateRange" type="daterange" format="MMM dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="false" @change="getDataUsingDatepicker" class="stationDatePicker">
                    </el-date-picker>
                </span>
            </div>
            <div class="card-alt" v-loading="statistics.isLoading" v-if="statistics.data">
                <div class="card-8 stats_area">
                    <span style="color:#525e69;" class="name">{{ $t('chargingStation.powerConsumption') }}(KWH)</span>
                    <div class="num_stats" v-if="statistics.data.totalEnergy">
                        <span class="num">{{ statistics.data.totalEnergy.value }}</span>
                        <span v-if="statistics.data.totalEnergy.trend!==0" :class="statistics.data.totalEnergy.trend>0?'positive num_trend':'negative num_trend'">
                            <i v-if="statistics.data.totalEnergy.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                            <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                            {{ Math.abs(statistics.data.totalEnergy.trend.toFixed(2)) }} %
                        </span>
                    </div>
                </div>
                <div class="card-8 stats_area">
                    <span style="color:#525e69;" class="name">{{ $t('chargingStation.totalTransaction') }}</span>
                    <div class="num_stats" v-if="statistics.data.transactions">
                        <span class="num">{{ statistics.data.transactions.value }}</span>
                        <span v-if="statistics.data.transactions.trend!==0" :class="statistics.data.transactions.trend>0?'positive num_trend':'negative num_trend'">
                            <i v-if="statistics.data.transactions.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                            <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                            {{ Math.abs(statistics.data.transactions.trend.toFixed(2)) }} %
                        </span>
                    </div>
                </div>
                <div class="card-8 stats_area">
                    <span style="color:#525e69;" class="name">{{ $t('chargingStation.totalUsers') }}</span>
                    <div class="num_stats" v-if="statistics.data.users">
                        <span class="num">{{ statistics.data.users.value }}</span>
                        <span v-if="statistics.data.users.trend!==0" :class="statistics.data.users.trend>0?'positive num_trend':'negative num_trend'">
                            <i v-if="statistics.data.users.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                            <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                            {{ Math.abs(statistics.data.users.trend.toFixed(2)) }}%
                        </span>
                    </div>
                </div>
                <div class="card-8 stats_area">
                    <span style="color:#525e69;" class="name">{{ $t('chargingStation.newUsers') }}</span>
                    <div class="num_stats" v-if="statistics.data.newUsers">
                        <span class="num">{{ statistics.data.newUsers.value }}</span>
                        <span v-if="statistics.data.newUsers.trend!==0" :class="statistics.data.newUsers.trend>0?'positive num_trend':'negative num_trend'">
                            <i v-if="statistics.data.newUsers.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                            <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                            {{ Math.abs( statistics.data.newUsers.trend.toFixed(2)) }}%
                        </span>
                    </div>
                </div>
                <div class="card-8 stats_area">
                    <span style="color:#525e69;" class="name">{{ $t('chargingStation.repeatedUsers') }}</span>
                    <div class="num_stats" v-if="statistics.data.repeatUsers">
                        <span class="num">{{ statistics.data.repeatUsers.value }}</span>
                        <span v-if="statistics.data.repeatUsers.trend!==0" :class="statistics.data.repeatUsers.trend>0?'positive num_trend':'negative num_trend'">
                            <i v-if="statistics.data.repeatUsers.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                            <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                            {{ Math.abs(statistics.data.repeatUsers.trend.toFixed(2)) }}%
                        </span>
                    </div>
                </div>
            </div>
            <div class="card-8"></div>
            <div class="card-8 table-result">
                <div class="header">{{ $t('menu.chargePoint') }}</div>
                <el-table :data="tableData" v-loading="isLoading" class="moreCol">
                    <el-table-column :label="$t('chargingStation.chargerId')" :min-width="3">
                        <template slot-scope="scope">
                            <el-link type="primary" underline @click="()=>handleLinkClick(scope.row)">#{{ scope.row.id }}</el-link>
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" :label="$t('general.name')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('chargingStation.powerConsumption')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.powerKw + "kW" }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connectionStatus')" :min-width="2">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.connectionStatus===`Connected`" :content="$t('general.connected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <el-tooltip v-else :content="$t('general.disconnected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('menu.chargePoint')" :min-width="2">
                        <template slot-scope="scope">
                            <Connector :dataObj="scope.row.connectors" :chargerStatus="scope.row.connectionStatus" :isBreak="true"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.lastHeartbeat')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="currentType" :label="$t('general.type')" :min-width="2"></el-table-column>

                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-dropdown trigger="click">
                                <el-button class="action_chargers_stations">
                                    {{ $t('general.action') }}<i class="el-icon-arrow-down el-icon--right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown" :class="isDark? 'dark-theme actions' : 'actions'">
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.chargingProfile') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'add')">{{ $t('general.add') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.chargingProfile') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'clear')">{{ $t('general.clear') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.diagnostics') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'start')">{{ $t('general.start') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.updates') }}

                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'run')">{{ $t('general.run') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.clearCache') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="openActionDialog(scope.row.id,'commonpopup', 'clearCache')">{{ $t('general.clear') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.softReset') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="openActionDialog(scope.row.id,'commonpopup', 'softReset')">{{ $t('general.reset') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.hardReset') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="openActionDialog(scope.row.id,'commonpopup', 'hardReset')">{{ $t('general.reset') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('general.modify') }} {{ $t('chargingStation.charger') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'edit')">{{ $t('general.modify') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('general.delete') }} {{ $t('chargingStation.charger') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'delete')">{{ $t('general.delete') }}</el-button>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <EditChargeBox name="chargeBox" :show="dialog.isVisible" :dialog="dialog" @close="(e)=>closeDialog(e,'edit')"></EditChargeBox>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog"></ShowPostion>
            <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :action="commonpopup.action" @close="closeActionDialog('commonpopup')"></CommonPopup>

        </div>
    </div>
</template>

<script>
import {
    $HTTP_getStationInfo,
    $HTTP_getAllChargeBoxList,
    $HTTP_deleteChargeBox,
    $HTTP_getConnectorSummary,
    $HTTP_getTransactionsStatistics
} from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import ShowPostion from "@/components/chargingStation/showPostion";
import EditChargeBox from "@/components/chargingStation/editChargeBox";
import Connector from "@/components/chargingStation/connector";
import CommonPopup from "@/components/commonPopup";
import moment from "moment";
export default {
    components: {
        ShowPostion,
        EditChargeBox,
        Connector,
        CommonPopup
    },
    data() {
        return {
            lang: this.$store.state.lang,
            curRouteParam: {
                stationId: "",
                stationName: ""
            },
            isDark: this.$store.state.darkTheme,
            permissionEditAble: this.$store.state.permissionEditable,
            isLoading: false,
            stationInfo: {
                zipCode: "",
                address: "",
                loc: {
                    lng: "",
                    lon: "",
                    lat: ""
                },
                serviceStartTime: "",
                serviceEndTime: "",
                countryCode: "",
                phone: ""
            },
            chargerCount: {
                acCount: null,
                dcCount: null
            },
            mapDialog: {
                visible: false,
                itemId: "",
                position: {
                    lat: "",
                    lng: ""
                }
            },
            smartSettingDialog: {
                visible: false,
                info: {
                    onOffStatus: false,
                    maxDemandPowerLimit: 0,
                    intervalMaxPower: 0,
                    intervalTime: 5
                },
                intervalTimeList: [5, 10, 15, 20, 30, 60]
            },
            tableData: [],
            total: 0,
            page: 1,
            dialog: {
                type: 1, //always 1 for edit
                info: {
                    chargeBoxId: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    },
                    chargeType: "AC",
                    installationDate: "",
                    chargeBoxName: "",
                    id: "",
                    power: 0
                },
                isVisible: false
            },
            connectorSummary: [],
            statistics: {
                data: [],
                isLoading: false
            },
            commonpopup: {
                show: false,
                chargePointId: null,
                action: ""
            },
            timeOut: null,
            dateRange: [],
            pickerOptions: {
                disabledDate(time) {
                    let today = moment().endOf("day").format("x");
                    return time.getTime() > today;
                }
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
        getTotal() {
            // add sum of values of object
            return (item) => {
                const values = Object.values(item);
                const sum = values.reduce((accumulator, value) => {
                    return accumulator + value;
                }, 0);
                return sum;
            };
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-stationInfo")
                ? JSON.parse(window.sessionStorage.getItem("fiics-stationInfo"))
                : null;
            if (!(temp && temp.stationId && temp.stationName)) {
                this.$router.go(-1);
            } else {
                this.curRouteParam = Object.assign({}, temp);
            }
        }
    },
    mounted() {
        setScrollBar(".scroll", this);

        // add dates
        const startOfDay = moment().startOf("day");
        const endOfDay = moment().endOf("day");
        this.dateRange = [new Date(startOfDay), new Date(endOfDay)];

        this.fetchStationDetail();
        let params = {};
        if (this.curRouteParam.stationId) {
            params.stationId = this.curRouteParam.stationId;
        }
        this.getChargersList(params);
        this.getConnectorsSummary(this.curRouteParam.stationId);
        this.getStatistics(this.curRouteParam.stationId);
    },
    beforeDestroy() {
        clearTimeout(this.timeOut);

        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods: {
        getConnectorsSummary(id) {
            let params = {};
            params.StationId = id;
            $HTTP_getConnectorSummary(params)
                .then((res) => {
                    if (res) {
                        this.connectorSummary = res;
                    }
                })
                .catch((err) => {
                    this.connectorSummary = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getStatistics(id) {
            let params = {};
            params.StationId = id;
            params.StartedAfter = this.dateRange[0];
            params.StartedBefore = this.dateRange[1];
            this.statistics.isLoading = true;
            $HTTP_getTransactionsStatistics(params)
                .then((res) => {
                    if (res) {
                        this.statistics.data = res;
                        this.statistics.isLoading = false;
                    }
                })
                .catch((err) => {
                    this.statistics.data = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        closeDialog() {
            this.dialog.isVisible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        runAction(data, action) {
            if (action === "edit") {
                this.openDialog(data);
            } else if (action === "delete") {
                this.deleteChargers(data.id);
            }
        },
        getChargersList(params) {
            $HTTP_getAllChargeBoxList(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        fetchStationDetail() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId
            };
            this.isLoading = true;
            $HTTP_getStationInfo(param)
                .then((data) => {
                    this.isLoading = false;
                    if (data?.id >= 0) {
                        this.stationInfo = {
                            stationId: data.id,
                            stationName: data.name,
                            zipCode: data.address.zipCode,
                            address: data.address.street,
                            loc: {
                                lng: data.coordinates.longitude,
                                lon: data.coordinates.longitude,
                                lat: data.coordinates.latitude
                            },
                            serviceStartTime: "5am",
                            serviceEndTime: "5pm",
                            phone: "None"
                        };
                        this.chargerCount = {
                            acCount: data.acCount,
                            dcCount: data.dcCount
                        };
                    } else {
                        this.$message({
                            type: "warning",
                            message:
                                that.lang === "en" ? data.message : data.reason
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        handleShowDialog() {
            this.mapDialog.itemId = this.stationId;
            this.mapDialog.position = this.stationInfo.loc;
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        goChargePointDetail(chargeBoxId) {
            const params = {
                chargeBoxId: chargeBoxId
            };
            this.$router.push({ name: "chargePointDetail", params: params });
        },
        handleLinkClick(row) {
            if (row) {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem(
                    "fiics-chargePointInfo",
                    JSON.stringify(data)
                );
                this.$router
                    .push({ name: "chargePointDetail", params: data })
                    .catch();
            }
        },
        openDialog(data) {
            this.dialog.info = {
                chargeBoxId: data.id,
                loc: {
                    lng: data.coordinates.longitude,
                    lon: data.coordinates.longitude,
                    lat: data.coordinates.latitude
                },
                chargeType: data.currentType,
                installationDate: data.installed,
                chargeBoxName: data.name,
                id: data.id,
                power: data.powerKw
            };
            this.dialog.isVisible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openActionDialog(row, type, action = "") {
            if (type === "commonpopup") {
                this.commonpopup.show = true;
                this.commonpopup.chargePointId = row;
                this.commonpopup.action = action;
            }
            this.setTimerApiCall();
        },
        setTimerApiCall() {
            //delay for 2seconds before requesting data
            this.timeOut = setTimeout(() => {
                let params = {};
                if (this.curRouteParam.stationId) {
                    params.stationId = this.curRouteParam.stationId;
                }
                this.getChargersList(params);
            }, 2000);
        },
        closeActionDialog(type) {
            if (type === "commonpopup") {
                this.commonpopup.show = false;
                this.commonpopup.chargePointId = null;
                this.commonpopup.action = "";
            }
        },
        deleteChargers(id) {
            const that = this;
            this.$confirm(
                i18n.t("general.deleteItem", { item: id }),
                i18n.t("general.hint"),
                {
                    showClose: false,
                    customClass: `custom ${
                        this.isDark ? "dark-theme" : "light-theme"
                    }`
                }
            ).then(() => {
                $HTTP_deleteChargeBox({ chargePointId: id })
                    .then((data) => {
                        if (data?.status === 204) {
                            that.$message({
                                type: "success",
                                message: i18n.t("general.sucDelMsg")
                            });
                            if (this.tableData.length === 1) {
                                if (this.page >= 2) {
                                    this.page = this.page - 1;
                                } else {
                                    this.page = 1;
                                }
                            }
                            that.fetchData();
                        } else {
                            this.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        }
                    })
                    .catch((err) => {
                        if (err.status === 500) {
                            that.$message({
                                type: "warning",
                                message: i18n.t("cannotDelete")
                            });
                        }
                    });
            });
        },
        getDataUsingDatepicker() {
            this.getStatistics(this.curRouteParam.stationId);
        }
    }
};
</script>
<style lang = "scss" scoped>
.card-8 {
    .header {
        color: #151e25;
        font-size: 1.25rem;
        display: flex;
        .title-value {
            margin-left: 200px;
            color: #0056ff;
        }
    }
    .chargePoint {
        margin-top: 16px;
        .title {
            font-size: 1.125rem;
            color: #151e25;
            cursor: pointer;
        }
        .connector-obj.detail {
            display: inline-block;
            width: calc(50% - 6px);
            box-sizing: border-box;
            + .connector-obj.detail:not(.even) {
                margin-left: 0;
            }
        }
    }
}
.graph_time {
    padding: 0px 0px 19px;
    display: flex;
    span {
        margin-left: auto;
        .stationDatePicker {
            background: transparent;
            border: 1px solid #525e69;
            display: flex;
            justify-content: space-evenly;
            width: 220px;
            padding: 0;
        }
    }
}

.action_chargers_stations {
    background-color: transparent;
    border-color: #409eff;
    border-width: 2px;
    color: #409eff;
    font-weight: 600;
}
.stats_area {
    width: calc(20% - 32px);
    margin-right: 12px;
    height: 47px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
}
.num_stats {
    display: flex;
    flex-direction: column;
    font-size: 1.25rem;
    .num {
        font-weight: bold;
    }
    .num_trend {
        &.positive {
            color: #33c85a;
        }
        &.negative {
            color: #fc2e56;
        }
    }
}
.card-alt {
    display: flex;
    width: 100%;
}
.rank-area {
    width: calc(33% - 32px);
    margin-right: 12px;
    height: 255px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    &:nth-child(4n + 1) {
        margin-right: 12px;
    }
    ul.rank {
        margin-top: 24px;
        padding-left: 0;
        margin: 28px 0 0 0;
        li {
            height: 26px;
            list-style: none;
            margin-bottom: 28px;
            &:last-child {
                margin-bottom: 0;
            }
            .label {
                margin-bottom: 6px;
                line-height: 20px;
                font-size: 1rem;
                display: flex;
                justify-content: space-between;
                min-width: 65px;
                .name {
                    display: inline-block;
                    color: #525e69;
                }
                .num {
                    display: inline-block;
                    float: right;
                    color: #525e69;
                }
                .actionFunction {
                    min-width: 85px;
                }
            }
            .connectors {
                display: flex;
                text-align: center;
                span {
                    margin-right: 2px;
                }
            }
        }
    }
}

.actionFunction {
    margin-left: 10px;
}
.actions {
    padding: 10px 0px;
    margin: 0px;
}

@media (min-width: 1251px) {
    .s-contain .item {
        width: calc(16.667% - 5px);
    }
}

@media (max-width: 1680px) {
    .rank-area {
        width: calc(33.05% - 36px);
    }
}

.el-link {
    text-decoration: underline;
    color: #0056ff;
}

.el-link:hover {
    text-decoration: none;
    color: #0056ff;
}

@media screen and (max-width: 800px) {
    .card-alt {
        flex-wrap: wrap;
    }

    .rank-area {
        flex: 100%;
    }
    .stats_area {
        flex: 25%;
    }
}
</style>
