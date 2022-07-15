<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + chargePointById[0].id }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="charge-point-info" v-loading="isLoading">
                    <div class="upperBody rank-area firstCol">
                        <div class="item title">
                            <div class="label">Charger Name</div>
                            <div class="content">{{ chargePointById[0].name }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                            <div class="content">
                                {{ chargePointById[0].id }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.power') }}</div>
                            <div class="content">{{ chargePointById[0].powerKw}} KWH</div>

                        </div>
                        <div class="item">
                            <div class="label">Connection Status</div>
                            <div class="content">
                                <div v-if="chargePointById[0].connectionStatus===`Connected`">
                                    <span class="circle-status color1"></span>
                                    <span> {{ $t('general.connected') }}</span>
                                </div>

                                <div v-else>
                                    <span class="circle-status color5"></span>
                                    <span> {{ $t('general.disconnected') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.type') }}</div>
                            <div class="content">{{ chargePointById[0].currentType }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                            <div class="content" v-if="chargePointById[0].chargePrice!==null">{{ $t('chargingStation.onPeak') + ' '+ getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.onPeak.rate+ '/'+getSymbols(chargePointById[0].chargePrice.onPeak.type)  }}</div>
                        </div>
                        <div class="item">
                            <div class="label"></div>
                            <div class="content" v-if="chargePointById[0].chargePrice!==null">{{ $t('chargingStation.offPeak') + ' '+getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.offPeak.rate+'/' +getSymbols(chargePointById[0].chargePrice.offPeak.type)  }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                            <div class="content" v-if="chargePointById[0].chargePrice!==null">{{ getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.occupancy.rate+'/' +getSymbols(chargePointById[0].chargePrice.occupancy.type)}}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.installationDate') }}</div>
                            <div class="content">{{getLocTime( chargePointById[0].created)}}</div>
                        </div>
                        <div class="item">
                            <div class="label">Operator</div>
                            <div class="content"></div>
                        </div>
                        <div class="item">
                            <div class="label">Last Heartbeat</div>
                            <div class="content"></div>
                        </div>
                        <div class="item">
                            <div class="label">Connectors</div>
                            <Connector :dataObj="chargePointById[0].connectors" :chargerStatus="chargePointById[0].connectionStatus" :isBreak="true"></Connector>

                        </div>
                    </div>
                    <div class="card-8 rank-area secondCol">
                        <!-- <el-button size="medium" type="primary"> Settings</el-button> -->
                        <div class="header">
                            <div class="title">Actions</div>
                        </div>
                        <ul class="rank">
                            <li>
                                <span>
                                    Add Charger Profile
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('add')">Add</el-button>
                            </li>
                            <li>
                                <span>
                                    Clear Charger Profile
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('clear')">Clear</el-button>
                            </li>
                            <li>
                                <span>
                                    Diagnostics
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('start')">Start</el-button>
                            </li>
                            <li>
                                <span>
                                    Updates
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('run')">Run</el-button>
                            </li>
                            <li>
                                <span>
                                    Clear Cache
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('clearCache')">Clear</el-button>
                            </li>
                            <li>
                                <span>
                                    Soft Reset
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('sodtReset')">Reset</el-button>
                            </li>
                            <li>
                                <span>
                                    Hard Reset
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('hardReset')">Reset</el-button>
                            </li>

                        </ul>
                    </div>
                    <div class="card-8 rank-area thirdCol">
                        <div class="header">
                            <div class="title">Connectors</div>
                        </div>
                        <el-table :data="chargePointById[0].connectors" class="moreCol" v-loading="isLoading">
                            <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                            <el-table-column label="Status(last)" :min-width="8">
                                <template slot-scope="scope">
                                    <el-tooltip v-if="scope.row.status==='Available'" :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status available"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Preparing'" :content="'Preparing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEVSE'" :content="'SuspendedEVSE'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEV'" :content="'SuspendedEV'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Finishing'" :content="'Finishing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Reserved'" :content="'Reserved'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Unavailable'" :content="'Unavailable'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status unavailable"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Faulted'" :content="'Faulted'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status unavailable"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Charging'" :content="'Charging'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <span style="margin-left:5px">{{scope.row.status}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="type" label="Type" :min-width="4"></el-table-column>
                            <el-table-column prop="powerKw" label="Max Output" :min-width="3"></el-table-column>
                            <el-table-column label="Charging" :width="146">
                                <template slot-scope="scope">
                                    <el-dropdown trigger="click">
                                        <el-button class="connectors_chargers">
                                            {{$t('general.action')}}<i class="el-icon-arrow-down el-icon--right"></i>
                                        </el-button>
                                        <el-dropdown-menu slot="dropdown" class="actions">
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-play" aria-hidden="true" style="color:#61b061"></i>
                                                </span>
                                                <span class="actionFunction" @click="runAction(scope.row, 'enableConnector')">Enable</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-stop" aria-hidden="true" style="color:red"></i>

                                                </span>
                                                <span class="actionFunction" @click="runAction(scope.row, 'disableConnector')">Disable</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-unlock" aria-hidden="true"></i>
                                                </span>
                                                <span class="actionFunction" @click="runAction(scope.row, 'unlockConnector')">Unlock</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.transaction')" name="transaction">
                        </el-tab-pane>
                    </el-tabs>
                    <Transaction v-if="active==='transaction'" :chargerId="chargePointById[0].id"></Transaction>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformToSymbols } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import ShowPostion from "@/components/chargingStation/showPostion";
import ChargingSession from "@/components/chargingStation/chargingSession";
import ChargePointAlert from "@/components/chargingStation/chargingPointAlert";
import Transaction from "@/components/chargingStation/transaction";
import Review from "@/components/chargingStation/review";
import { $HTTP_getChargeBoxDetail, $HTTP_updateOccpAvailability, $HTTP_getAllChargeBoxList } from "@/api/api";
import moment from "moment";
import { $GLOBAL_CURRENCY, $GLOBAL_GRAFANA } from "@/utils/global";
import FMCSTemplate from "@/components/info/fmcsTemplate";
import unknown from "imgs/help_icon.svg";

const baseGrafanaUrl = $GLOBAL_GRAFANA;
var costRevenueUrl = `${baseGrafanaUrl}/UmtVrts7k/cost-and-revenue?orgId=1&kiosk&refresh=1m`;

export default {
    components: {
        Connector,
        ShowPostion,
        ChargingSession,
        ChargePointAlert,
        Review,
        FMCSTemplate,
        Transaction,
        Connector,
    },
    data() {
        return {
            unknown: unknown,
            costRevenueUrl: costRevenueUrl,
            filter: {
                dateRange: [],
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
            },
            permissionShowAlertAble: this.$store.state.permissionEditable,
            curRouteParam: {
                chargeBoxId: null,
                serial: "",
                chargeBoxName: "",
                loc: {
                    lon: "",
                    lat: "",
                },
                power: "",
                chargeBoxStatus: "",
                connectorList: [],
                chargeType: "",
                currency: "",
                onPeakElectricityRate: "",
                onPeakElectricityRateType: 1,
                offPeakElectricityRate: "",
                offPeakElectricityRateType: 1,
                parkingRate: "",
                parkingRateType: 1,
                installationDate: "",
            },
            isLoading: false,
            active: "transaction",
            // mapDialog: {
            //     visible: false,
            //     itemId: "",
            //     position: {
            //         lat: "",
            //         lng: "",
            //     },
            // },
            timer: null,
            timeOut:null,
            // count: {
            //     available: 0,
            //     inUse: 0,
            //     unavailable: 0,
            //     total: 0,
            // },
            chargePointById: [],
        };
    },
    created() {
        let chargePointInfo = JSON.parse(window.sessionStorage.getItem("fiics-chargePointInfo"));
        this.curRouteParam = {
            chargeBoxId: chargePointInfo.id,
            serial: chargePointInfo.serial,
            chargeBoxName: chargePointInfo.name,
            loc: {
                lon: chargePointInfo.coordinates.longitude,
                lat: chargePointInfo.coordinates.latitude,
            },
            power: chargePointInfo.powerKilowatts,
            chargeBoxStatus: chargePointInfo.status,
            connectorList: chargePointInfo.connectors,
            chargeType: chargePointInfo.currentType,
            currency: "",
            onPeakElectricityRate: 0,
            onPeakElectricityRateType: 1,
            offPeakElectricityRate: 0,
            offPeakElectricityRateType: 1,
            parkingRate: 0,
            parkingRateType: 1,
            installationDate: chargePointInfo.installed,
        };

        const todaySplit = moment().format("YYYY-MM-DD").split("-");
        const thisMonth1st = todaySplit[0] + "-" + todaySplit[1] + "-01";
        let dayWeekBefore = parseInt(todaySplit[2]) - 7;
        if (dayWeekBefore < 10) {
            dayWeekBefore = "0" + dayWeekBefore;
        } else {
            dayWeekBefore = `${dayWeekBefore}`;
        }
        const thisWeekBefore = todaySplit[0] + "-" + todaySplit[1] + "-" + dayWeekBefore;

        if (todaySplit[2] === "01") {
            this.filter.dateRange = [thisMonth1st, thisMonth1st];
        } else {
            const today = moment().format("YYYY-MM-DD");
            this.filter.dateRange = [thisWeekBefore, today];
        }
        this.updateGrafanaUrl();
    },
    mounted() {
        this.getChargePointsById(this.curRouteParam.chargeBoxId);
        setScrollBar(".scroll", this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-chargePointInfo");
        clearInterval(this.timer);
        clearTimeout(this.timeOut)
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
    },
    methods: {
        runAction(data, action) {
            let params = { ...data };

            if (action === "enableConnector") {
                params.type = "Operative";
                params.connectorId = params.id;
                this.updateOccpAvailability(params);
            } else if (action === "disableConnector") {
                params.type = "Inoperative";
                params.connectorId = params.id;
                this.updateOccpAvailability(params);
            }
        },
        fetchData(notLoading) {
            const that = this,
                params = {
                    chargeBoxId: this.curRouteParam.chargeBoxId,
                };
            if (!notLoading) this.isLoading = true;
            $HTTP_getChargeBoxDetail(params)
                .then((data) => {
                    this.isLoading = false;
                    if (!!data.success) {
                        this.curRouteParam = Object.assign({}, data.chargeBoxInfo);
                        this.curRouteParam.installationDate = transformUtcToLocTime(
                            this.curRouteParam.installationDate
                        );
                        this.curRouteParam.currency = $GLOBAL_CURRENCY[data.chargeBoxInfo.unitType];
                    } else {
                        this.$message({ type: "warning", message: data?.message });
                    }
                })
                .catch((err) => {
                    console.log("getChargeBoxDetail", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        getChargePointsById(id) {
            console.log(id);
            let params = {};
            params.Id = id;
            $HTTP_getAllChargeBoxList(params)
                .then((res) => {
                    console.log(res.data[0]);
                    if (res?.data?.length > 0) {
                        this.chargePointById = res.data;
                    } else {
                        this.chargePointById = [];
                        this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                    }
                })
                .catch((err) => {
                    this.chargePointById = [];
                    console.log(err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        updateOccpAvailability(params) {
            console.log("update availability");
            console.log(this.chargePointById);
            params.chargeBoxId = this.chargePointById[0].id;
            console.log(params);
            $HTTP_updateOccpAvailability(params)
                .then((data) => {
                    console.log(data);
                    if (data === "Accepted") {
                        this.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                        this.timeOut = setTimeout(() => {
                            this.getChargePointsById(this.chargePointById[0].id);
                        }, 2000);
                    }
                })
                .catch((err) => {
                    console.log("occpAvailability", err);
                    this.$message({ type: "warning", message: err.data });
                });
        },
        handleShowDialog() {
            // this.mapDialog.itemId = this.curRouteParam.chargeBoxId;
            // this.mapDialog.position = { lat: this.curRouteParam.loc.lat, lng: this.curRouteParam.loc.lon };
            // this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleTabClick(tab, event) {},
        closeShowPosDialog() {
            // this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        updateApi() {
            this.updateGrafanaUrl();
        },
        updateGrafanaUrl() {
            let startDate = this.filter.dateRange[0];
            let endDate = moment(this.filter.dateRange[1]).endOf("day");
            startDate = moment(startDate).format("x");
            endDate = moment(endDate).format("x");
            this.costRevenueUrl = costRevenueUrl + `&from=` + startDate + `&to=` + endDate;
            this.updateTheme();
        },
        updateTheme() {
            let isDark = this.$store.state.darkTheme;
            this.costRevenueUrl = isDark ? this.costRevenueUrl + `&theme=dark` : this.costRevenueUrl + `&theme=light`;
        },
    },
};
</script>
<style lang = "scss" scoped>
.card-8 {
    padding: 28px;
    .header {
        font-size: 1.5rem;
        font-weight: bold;
    }
    .charge-point-info {
        display: flex;
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1rem;
                color: #525e69;
                letter-spacing: 0;
            }
            .content {
                display: inline-block;
                font-size: 1rem;
                color: #151e25;
                letter-spacing: 0;
                .circle-status {
                    vertical-align: top;
                }
                .connectors {
                    display: flex;
                    p {
                        margin-block-start: 0;
                        margin-block-end: 5px;
                        margin-left: 5px;
                    }
                }
            }
        }
        .title {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1.5rem;
                color: black;
                letter-spacing: 0;
                font-weight: bold;
            }
            .content {
                display: inline-block;
                font-size: 1.5rem;
                color: blue;
                font-weight: bold;
                letter-spacing: 0;
                .circle-status {
                    vertical-align: top;
                }
            }
        }
    }

    .firstCol {
        width: calc(26.05% - 32px) !important;
    }

    .secondCol {
        width: calc(20.05% - 32px) !important;
    }

    .thirdCol {
        width: calc(40.05% - 32px) !important;
    }

    .rank-area {
        margin-right: 12px;
        height: auto;
        position: relative;
        vertical-align: top;
        &:nth-child(4n + 1) {
            margin-right: 0px;
        }
        .title {
            font-size: 20px;
            margin-top: 10px;
        }
        ul.rank {
            margin-top: 14px;
            padding-left: 0;
            li {
                height: 26px;
                list-style: none;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
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
                }
                .actionFunction {
                    min-width: 65px;
                }
            }
        }
    }
}
.actions li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .actionFunction {
        min-width: 65px;
    }
}

.connectors_chargers {
    color: #409eff;
    background-color: transparent;
    border-color: transparent;
    font-weight: 600;
}
</style>