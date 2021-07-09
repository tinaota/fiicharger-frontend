<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/station' }">{{ $t('menu.station') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 station-detail">
                <div class="header">
                    {{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}
                    <el-tooltip :content="curRouteParam.loc.lon+','+curRouteParam.loc.lat" placement="right" effect="light" popper-class="custom">
                        <el-button type="primary" icon="el-icon-map-location" circle @click="handleShowDialog()"></el-button>
                    </el-tooltip>
                </div>
                <div>
                    <div class="sec-header long"><i class="el-icon-office-building"></i> {{ curRouteParam.address }}</div>
                    <!-- <div class="sec-header"><i class="el-icon-alarm-clock"></i> {{ curRouteParam.serviceStartTime + ' ~ ' + curRouteParam.serviceEndTime }}</div>
                    <div class="sec-header" style="margin-left: 16px"><i class="el-icon-phone-outline"></i> {{ curRouteParam.countryCode + " " + curRouteParam.phone }}</div> -->
                </div>
                <div class="s-contain" v-loading="detail.isLoading">
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.nChargeBox') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(detail.data.chargeBoxCount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('menu.chargingSession') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(detail.data.stationSessionCount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.accumCharging') }}</div>
                        <div class="content">
                            <span>{{ detail.data.stationAccumulativeEnergy + "kWh" }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.avgPrice') }}</div>
                        <div class="content">
                            <span>{{ detail.data.electricityRateCurrency + detail.data.electricityRate + "/kWh" }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                        <div class="content">
                            <span>{{ detail.data.parkingRateCurrency + detail.data.parkingRate + "/" + $t('chargingStation.elecRateUnit')[1] }}</span>
                        </div>
                    </div>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.chargeBox')" name="chargeBoxList">
                            <ChargeBoxList :stationId="curRouteParam.stationId"></ChargeBoxList>
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                            <ChargingSession :stationId="curRouteParam.stationId"></ChargingSession>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <div class="chart">
                    <div class="header">{{ $t('chargingStation.chargingSessionAnalysis') }}
                        <el-select
                            class="select-small right"
                            v-model="chartChargingSesstion.search"
                            @change="handleSelected('chartChargingSesstion')">
                            <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                        </el-select>
                    </div>
                    <BarChart class="barChart" id="chartChargingSesstion" :chartData="chartChargingSesstion.chartData"></BarChart>
                </div>
                <div class="chart">
                    <div class="header">{{ $t('chargingStation.powerUsedAnalysis') }}
                        <el-select
                            class="select-small right"
                            v-model="chartPowerUsed.search"
                            @change="handleSelected('chartPowerUsed')">
                            <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                        </el-select>
                    </div>
                    <BarChart class="barChart" id="chartPowerUsed" :chartData="chartPowerUsed.chartData"></BarChart>
                </div>
            </div>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="()=> {this.mapDialog.visible=false}" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { $HTTP_getStationDetail, $HTTP_getChargingSessionAnalysisInfo, $HTTP_getPowerUsageAnalysisInfo } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import StationDetailData from "@/tmpData/stationDetailData";
import { setScrollBar } from "@/utils/function";
import moment from "moment";
import BarChart from "@/components/charts/barChart";
import ChargeBoxList from "@/components/chargingStation/chargeBoxList";
import ChargingSession from "@/components/chargingStation/chargingSession";
import ShowPostion from "@/components/chargingStation/showPostion";
export default {
    components: {
        BarChart,
        ChargeBoxList,
        ChargingSession,
        ShowPostion
    },
    data() {
        return {
            curRouteParam: {},
            lang: '',
            detail: {
                isLoading: false,
                data: {
                    chargeBoxCount: 0,
                    stationSessionCount: 0,
                    stationAccumulativeEnergy: 0,
                    electricityRateCurrency: '',
                    electricityRate: 0,
                    parkingRateCurrency: '',
                    parkingRate: 0
                }
            },
            daySelectList: i18n.t('chargingStation.daySelectList'),
            chartChargingSesstion: {
                search: 1,
                isLoading: false,
                chartData: {
                    timeList: [],
                    data: [],
                    unit: ''
                }
            },
            chartPowerUsed: {
                search: 1,
                isLoading: false,
                chartData: {
                    timeList: [],
                    data: [],
                    unit: 'kWh'
                }
            },
            active: 'chargeBoxList',
            mapDialog: {
                visible: false,
                itemId: '',
                position: {
                    lat: '',
                    lng: ''
                }
            }
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-stationInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-stationInfo")) : null;
            if (temp && temp.stationId && temp.stationName
                && temp.loc && temp.loc.lon && temp.loc.lat
                && temp.address) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchStationDetail();
        this.fetchChartSesstionData();
        this.fetchChartPowerUsedData();
        setScrollBar('.scroll', this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods : {
        fetchStationDetail() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId
            };
            this.detail.isLoading = true;
            $HTTP_getStationDetail(param).then((data) => {
                this.detail.isLoading = false;
                if (!!data.success) {
                    this.detail.data = Object.assign({}, data.stationInfo);
                    this.detail.data.electricityRateCurrency = $GLOBAL_CURRENCY[data.stationInfo.electricityRateUnitType] || 1;
                    this.detail.data.parkingRateCurrency = $GLOBAL_CURRENCY[data.stationInfo.parkingRateUnitType] || 1;
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchChartSesstionData() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId,
                dateType: that.chartChargingSesstion.search
            };
            this.chartChargingSesstion.isLoading = true;
            $HTTP_getChargingSessionAnalysisInfo(param).then((data) => {
                this.chartChargingSesstion.isLoading = false;
                if (!!data.success) {
                    this.chartChargingSesstion.chartData.data = data.dataList;
                    this.chartChargingSesstion.chartData.timeList = data.timeList;
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chartChargingSesstion', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchChartPowerUsedData() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId,
                dateType: that.chartPowerUsed.search
            };
            this.chartPowerUsed.isLoading = true;
            $HTTP_getPowerUsageAnalysisInfo(param).then((data) => {
                this.chartPowerUsed.isLoading = false;
                if (!!data.success) {
                    this.chartPowerUsed.chartData.data = data.dataList;
                    this.chartPowerUsed.chartData.timeList = data.timeList;
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chartPowerUsed', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        handleShowDialog() {
            this.mapDialog.itemId = this.curRouteParam.stationId;
            this.mapDialog.position = this.curRouteParam.loc;
            this.mapDialog.visible = true;
        },
        handleSelected(item) {
            if (item === 'chartChargingSesstion') {
                this.fetchChartSesstionData();
            } else {
                this.fetchChartPowerUsedData()
            }
        },
        handleTabClick(tab, event) {}
    }
}
</script>
<style lang = "scss" scoped>
.station-detail {
    width: calc(100% - 40px);
    .header {
        color: #151E25;
        font-size: 1.25rem;
    }
    .sec-header {
        font-size: 0.875rem;
        color: #525E69;
        &.long {
            margin: 12px 0;
        }
        &:not(.long) {
            width: auto;
            display: inline-block;
            margin-bottom: 12px;
        }
    }
    .s-contain {
        width: calc(100% - 32px);
        height: 246px;
        padding: 0 0 0 32px;
        background: #DDE7F5;
        border-radius: 4px;
        margin-bottom: 28px;
        .item {
            padding: 12px 0;
            display: inline-block;
            width: calc(50% - 16px);
            float: left;
            .label {
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
                margin-bottom: 6px;
            }
            .content {
                font-size: 1.875rem;
                color: #151E25;
                letter-spacing: 0;
                .name-wrapper {
                    color: #89c0f9;
                    cursor: pointer;
                }
            }
        }
    }
    .chart {
        width: 100%;
        height: calc(18px + 30vh);
        position: relative;
        margin-bottom: 28px;
        .header {
            font-size: 1rem;
            color: #525E69;
        }
        .barChart {
            height: 30vh;
        }
    }
    .tabs-contain {
        margin-bottom: 28px;
    }
}
@media only screen and (max-width: 1600px) and (min-width: 1201px) {
    .station-detail {
        .s-contain {
            height: 164px;
            .item {
                width: calc(33.33% - 11px);
            }
        }
        .chart {
            width: calc(50% - 18px);
            display: inline-block;
            /* float: left; */
            + .chart {
                margin-left: 36px;
                float: right;
            }
        }
    }
}
@media (min-width: 1601px) {
    .station-detail .s-contain {
        height: 82px;
        .item {
            width: calc(16.67% - 5.34px);
        }
    }
}
</style>