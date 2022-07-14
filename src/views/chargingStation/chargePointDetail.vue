<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.chargeBoxId }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="charge-point-info" v-loading="isLoading">
                    <div class="upperBody rank-area firstCol">
                        <div class="item title">
                            <div class="label">Charger Name</div>
                            <div class="content">{{ curRouteParam.chargeBoxName }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                            <div class="content">
                                {{ curRouteParam.chargeBoxId }}
                                <el-tooltip v-if="curRouteParam.loc && curRouteParam.loc.lon && curRouteParam.loc.lat" :content="curRouteParam.loc.lon+','+curRouteParam.loc.lat" placement="right" effect="light" popper-class="custom">
                                    <el-button class="no-bg loc" @click="handleShowDialog"></el-button>
                                </el-tooltip>
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.power') }}</div>
                            <!-- <div class="content">{{ curRouteParam.power + "kW" }}</div> -->
                            <div class="content">{{ "347KWH" + "kW" }}</div>

                        </div>
                        <div class="item">
                            <div class="label">Connection Status</div>
                            <div class="content">
                                <div v-if="curRouteParam.chargeBoxStatus===`Connected`">
                                    <span class="circle-status color1"></span>
                                    <span> {{ $t('general.connected') }}</span>
                                </div>

                                <div v-else>
                                    <span class="circle-status color5"></span>
                                    <span> {{ $t('general.disconnected') }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- <div class="item">
                            <div class="label">{{ $t('chargingStation.connector') }}</div>
                            <div class="content">
                                <Connector v-for="(item, idx) in curRouteParam.connectorList" :key="idx" :dataObj="item"></Connector>
                            </div>
                        </div> -->
                        <div class="item">
                            <div class="label">{{ $t('general.type') }}</div>
                            <div class="content">{{ curRouteParam.chargeType === 1 ? "AC" : "DC" }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                            <div class="content">{{ $t('chargingStation.onPeak') + ' '+ curRouteParam.currency + curRouteParam.onPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[curRouteParam.onPeakElectricityRateType] }}</div>
                        </div>
                        <div class="item">
                            <div class="label"></div>
                            <div class="content">{{ $t('chargingStation.offPeak') + ' '+ curRouteParam.currency + curRouteParam.offPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[curRouteParam.offPeakElectricityRateType] }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                            <div class="content">{{ curRouteParam.currency + curRouteParam.parkingRate + '/' +  $t("chargingStation.parkingRateUnit")[curRouteParam.parkingRateType] }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.installationDate') }}</div>
                            <div class="content">2022-04-17 17:00:00</div>
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
                            <div class="content"></div>
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
                            <li>
                                <span>
                                    Diagnostics
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('start')">Start</el-button>
                            </li>

                        </ul>
                    </div>
                    <div class="card-8 rank-area thirdCol">
                        <div class="header">
                            <div class="title">Connectors</div>
                        </div>
                        <el-table :data="curRouteParam.connectorList" class="moreCol" v-loading="isLoading">
                            <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                            <el-table-column label="Status(last)" :min-width="8">
                                <template slot-scope="scope">
                                    <el-tooltip v-if="scope.row.status==='Available'" :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color1"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Preparing'" :content="'Preparing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color2"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEVSE'" :content="'SuspendedEVSE'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color6"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEV'" :content="'SuspendedEV'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color6"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Finishing'" :content="'Finishing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color2"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Reserved'" :content="'Reserved'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color5"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Unavailable'" :content="'Unavailable'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color4"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Faulted'" :content="'Faulted'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color0"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Charging'" :content="'Charging'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status color1"></span>
                                    </el-tooltip>
                                    <span style="margin-left:5px">{{scope.row.status}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="type" label="Type" :min-width="4"></el-table-column>
                            <el-table-column prop="powerKw" label="Max Output" :min-width="3"></el-table-column>
                            <el-table-column label="Charging" :width="146">
                                <template slot-scope="scope">
                                    <el-dropdown trigger="click">
                                        <el-button type="primary">
                                            {{$t('general.action')}}<i class="el-icon-arrow-down el-icon--right"></i>
                                        </el-button>
                                        <el-dropdown-menu slot="dropdown" class="actions">
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-play" aria-hidden="true" style="color:#61b061"></i>
                                                </span>
                                                <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'add')">Start</el-button>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-stop" aria-hidden="true" style="color:red"></i>

                                                </span>
                                                <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'clear')">Stop</el-button>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-unlock" aria-hidden="true"></i>
                                                </span>
                                                <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'start')">Unlock</el-button>
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
                        <!-- <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('chargingStation.chargePointAlert')" name="chargePointAlert">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.costRevenue')" name="costRevenue">
                        </el-tab-pane> -->
                        <el-tab-pane :label="$t('menu.transaction')" name="transaction">
                        </el-tab-pane>
                    </el-tabs>

                    <ChargingSession v-if="active==='chargingSession'" :chargeBoxId="curRouteParam.chargeBoxId"></ChargingSession>
                    <ChargePointAlert v-if="permissionShowAlertAble && active==='chargePointAlert'" :chargeBoxId="curRouteParam.chargeBoxId"></ChargePointAlert>
                    <!-- <el-tab-pane :label="$t('userAccount.reviewSummary')" name="review">
                            <Review :chargeBoxId="curRouteParam.chargeBoxId"></Review>
                        </el-tab-pane> -->
                    <div v-if="curRouteParam.chargeBoxId!==undefined && active=== 'costRevenue'">
                        <div class="filter">
                            <el-date-picker v-model="filter.dateRange" type="daterange" value-format="yyyy-MM-dd" format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="true" @change="updateApi()">
                            </el-date-picker>
                        </div>
                        <FMCSTemplate :url="costRevenueUrl+`&var-chargeBoxId=`+curRouteParam.chargeBoxId"></FMCSTemplate>
                    </div>
                    <Transaction v-if="active==='transaction'" :chargerId="curRouteParam.chargeBoxId"></Transaction>
                </div>
            </div>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog"></ShowPostion>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import ShowPostion from "@/components/chargingStation/showPostion";
import ChargingSession from "@/components/chargingStation/chargingSession";
import ChargePointAlert from "@/components/chargingStation/chargingPointAlert";
import Transaction from "@/components/chargingStation/transaction";
import Review from "@/components/chargingStation/review";
import { $HTTP_getChargeBoxDetail } from "@/api/api";
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
            mapDialog: {
                visible: false,
                itemId: "",
                position: {
                    lat: "",
                    lng: "",
                },
            },
            timer: null,
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
        // this.fetchData(); //api尚未完成
        // this.lang = window.sessionStorage.getItem("fiics-lang");
        // this.timer = setInterval(() => {
        //     this.fetchData(true);
        // }, 5000);

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
        setScrollBar(".scroll", this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-chargePointInfo");
        clearInterval(this.timer);
    },
    methods: {
        runAction(data, action) {
            console.log(data, action);
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
        handleShowDialog() {
            this.mapDialog.itemId = this.curRouteParam.chargeBoxId;
            this.mapDialog.position = { lat: this.curRouteParam.loc.lat, lng: this.curRouteParam.loc.lon };
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleTabClick(tab, event) {},
        closeShowPosDialog() {
            this.mapDialog.visible = false;
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
        margin-bottom: 80px;
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

    .thirdCol{
        width: calc(40.05% - 32px) !important

    }

    .rank-area {
        margin-right: 12px;
        height: 255px;
        position: relative;
        vertical-align: top;
        padding-bottom: 48px;
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
</style>