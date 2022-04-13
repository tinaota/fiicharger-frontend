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
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
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
                        <div class="content">{{ curRouteParam.power + "kW" }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('general.status') }}</div>
                        <div class="content">
                            <div v-if="curRouteParam.chargeBoxStatus===1">
                                <span class="circle-status color1"></span>
                                <span> {{ $t('general.available') }}</span>
                            </div>
                            <div v-else-if="curRouteParam.chargeBoxStatus===2">
                                <span class="circle-status color2"></span>
                                <span> {{ $t('general.inUse') }}</span>
                            </div>
                            <div v-else-if="curRouteParam.chargeBoxStatus===3">
                                <span class="circle-status color3"></span>
                                <span> {{ $t('general.maintenance') }}</span>
                            </div>
                            <div v-else-if="curRouteParam.chargeBoxStatus===4">
                                <span class="circle-status color4"></span>
                                <span> {{ $t('general.alert') }}</span>
                            </div>
                            <div v-else>
                                <span class="circle-status color5"></span>
                                <span> {{ $t('general.unavailable') }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.connector') }}</div>
                        <div class="content">
                            <Connector v-for="(item, idx) in curRouteParam.connectorList" :key="idx" :dataObj="item"></Connector>
                        </div>
                    </div>
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
                        <div class="content">{{ curRouteParam.installationDate }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('menu.operator') }}</div>
                        <div class="content">{{ curRouteParam.operatorTypeName }}</div>
                    </div>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('chargingStation.chargePointAlert')" name="chargePointAlert">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.costRevenue')" name="costRevenue">
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
import Review from "@/components/chargingStation/review";
import { $HTTP_getChargeBoxDetail } from "@/api/api";
import moment from "moment";
import { $GLOBAL_CURRENCY } from "@/utils/global";
import FMCSTemplate from "@/components/info/fmcsTemplate";
const baseGrafanaUrl = process.env.VUE_APP_GRAFANA_BASE_URL;
var costRevenueUrl = `${baseGrafanaUrl}/UmtVrts7k/cost-and-revenue?orgId=1&kiosk&refresh=1m&theme=light`;

export default {
    components: {
        Connector,
        ShowPostion,
        ChargingSession,
        ChargePointAlert,
        Review,
        FMCSTemplate,
    },
    data() {
        return {
            active: "chargingSession",
            lang: "",
            costRevenueUrl: costRevenueUrl,
            filter: {
                dateRange: [],
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
            },
            permissionShowAlertAble: true,
            curRouteParam: {
                chargeBoxId: "",
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
                operatorTypeName: "",
            },
            isLoading: false,
            active: "chargingSession",
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
        const userData = JSON.parse(window.sessionStorage.getItem("fiics-user")),
            accPermissionType = userData.accountInfo.accPermissionType;
        if (accPermissionType === 6) {
            this.permissionShowAlertAble = false;
        }
        this.curRouteParam = this.$router.currentRoute.params;
        this.curRouteParam = {
            chargeBoxId: this.curRouteParam.chargeBoxId,
            chargeBoxName: "",
            loc: {
                lon: "",
                lat: "",
            },
            power: 0,
            chargeBoxStatus: "",
            connectorList: [],
            chargeType: "",
            currency: "",
            onPeakElectricityRate: 0,
            onPeakElectricityRateType: 1,
            offPeakElectricityRate: 0,
            offPeakElectricityRateType: 1,
            parkingRate: 0,
            parkingRateType: 1,
            installationDate: "",
            operatorTypeName: "",
        };
        this.fetchData(); //api尚未完成
        this.lang = window.sessionStorage.getItem("fiics-lang");
        this.timer = setInterval(() => {
            this.fetchData(true);
        }, 5000);

        const todaySplit = moment().format("YYYY-MM-DD").split("-");
        const thisMonth1st = todaySplit[0] + "-" + todaySplit[1] + "-01";

        if (todaySplit[2] === "01") {
            this.filter.dateRange = [thisMonth1st, thisMonth1st];
        } else {
            const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
            this.filter.dateRange = [thisMonth1st, yesterday];
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
                        this.$message({ type: "warning", message: that.lang === "en" ? data.message : data.reason });
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
            let endDate = moment(this.filter.dateRange[1]).endOf('day');
            startDate = moment(startDate).format("x");
            endDate = moment(endDate).format("x");
            this.costRevenueUrl = costRevenueUrl + `&from=` + startDate + `&to=` + endDate;
        },
    },
};
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .charge-point-info {
        margin-bottom: 28px;
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
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151e25;
                letter-spacing: 0;
                .circle-status {
                    vertical-align: top;
                }
            }
        }
    }
}
</style>