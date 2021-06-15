<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/stationList' }">{{ $t('menu.stationList') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 station-detail">
                <div class="header">{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</div>
                <div class="sec-header"><i class="el-icon-location-information"></i>{{ curRouteParam.location }}</div>
                <div class="s-contain">
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.nChargeBox') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(info.chargeBoxNum) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('menu.chargingSession') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(info.chargeSessionNum) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.accumCharging') }}</div>
                        <div class="content">
                            <span>{{ info.powerUsed + "kWh" }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.avgPrice') }}</div>
                        <div class="content">
                            <span>{{ "$" + info.avgPrice + "/kWh"}}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                        <div class="content">
                            <el-popover trigger="click" popper-class="dark" width="420" placement="left" :offset="-10" :visible-arrow="false">
                                <el-table :data="info.electricityRateInfo">
                                    <el-table-column v-for="item in info.electricityRateKey" :key="item" :prop="item" :label="item"></el-table-column>
                                </el-table>
                                <div slot="reference" class="name-wrapper">{{ info.electricityRate }}</div>
                            </el-popover>
                        </div>
                    </div>
                </div>
                <div class="chart">
                    <div class="header">{{ $t('chargingStation.chargingStationAnalysis') }}
                        <el-select
                            class="select-small dark right"
                            v-model="chartChargingSesstion.search"
                            @change="handleSelected('chartChargingSesstion')">
                            <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                        </el-select>
                    </div>
                    <BarChart class="barChart" id="chartChargingSesstion" :chartData="chartChargingSesstion.chartData"></BarChart>
                </div>
                <div class="chart">
                    <div class="header">{{ $t('chargingStation.powerUsedAnalysis') }}
                        <el-select
                            class="select-small dark right"
                            v-model="chartPowerUsed.search"
                            @change="handleSelected('chartPowerUsed')">
                            <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                        </el-select>
                    </div>
                    <BarChart class="barChart" id="chartPowerUsed" :chartData="chartPowerUsed.chartData"></BarChart>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.chargeBoxList')" name="chargeBoxList">
                            <ChargeBoxList :tableData="chargeBoxData"></ChargeBoxList>
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                            <ChargingSession :tableData="chargingSessionData"></ChargingSession>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import StationDetailData from "@/tmpData/stationDetailData";
import { setScrollBar } from "@/utils/function";
import moment from "moment";
import BarChart from "@/components/charts/barChart";
import ChargeBoxList from "@/components/chargingStation/chargeBoxList";
import ChargingSession from "@/components/chargingStation/chargingSession";
export default {
    components: {
        BarChart,
        ChargeBoxList,
        ChargingSession
    },
    data() {
        return {
            curRouteParam: {},
            info: {
                chargeBoxNum: 0,
                chargeSessionNum: 0,
                powerUsed: 0,
                avgPrice: 0,
                electricityRate: "",
                electricityRateInfo: [],
                electricityRateKey: []
            },
            daySelectList: i18n.t('chargingStation.daySelectList'),
            chartChargingSesstion: {
                search: '7',
                chartData: {
                    timeList: [],
                    data: [],
                    unit: ''
                }
            },
            chartPowerUsed: {
                search: '7',
                chartData: {
                    timeList: [],
                    data: [],
                    unit: 'kWh'
                }
            },
            active: 'chargeBoxList',
            chargeBoxData: [],
            chargingSessionData: []
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-stationInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-stationInfo")) : null;
            if (temp && temp.stationId && temp.stationName && temp.location) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
    },
    mounted() {
        this.fetchData();

    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods : {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let data = Object.assign({}, StationDetailData[this.curRouteParam.stationId]);
            this.getChartSesstionData();
            this.getChartPowerUsedData();
            this.info = data.info;
            this.chargeBoxData = data.chargeBoxList;
            this.chargingSessionData = data.chargingSession;
            setScrollBar('.scroll', this);
        },
        getChartSesstionData() {
            let data = [],
                timeList = [],
                time = parseInt(this.chartChargingSesstion.search);
            if (time <= 30) {
                for(var i = time; i>=1; i--) {
                    data.push(50 + Math.floor(Math.random() * 251)); //50-300
                    timeList.push(moment().subtract(i, 'days').format('MM/DD'));
                }
            } else {
                for(var i = (12-1); i>=0; i--) {
                    data.push(100 + Math.floor(Math.random() * 8901)); //100-9000
                    timeList.push(moment().subtract(i, 'months').format('YYYY-MM'));
                }
            }
            this.chartChargingSesstion.chartData.data = data;
            this.chartChargingSesstion.chartData.timeList = timeList;
        },
        getChartPowerUsedData() {
            let data = [],
                timeList = [],
                time = parseInt(this.chartPowerUsed.search);
            if (time <= 30) {
                for(var i = time; i>=1; i--) {
                    data.push( Math.floor(Math.random() * 21*10)/10); //0-20
                    timeList.push(moment().subtract(i, 'days').format('MM/DD'));
                }
            } else {
                for(var i = (12-1); i>=0; i--) {
                    data.push(5 + Math.floor(Math.random() * 295*10)/10); //5-300
                    timeList.push(moment().subtract(i, 'months').format('YYYY-MM'));
                }
            }
            this.chartPowerUsed.chartData.data = data;
            this.chartPowerUsed.chartData.timeList = timeList;
        },
        handleSelected(item) {
            if (item === 'chartChargingSesstion') {
                this.getChartSesstionData();
            } else {
                this.getChartPowerUsedData()
            }
        },
        handleTabClick(tab, event) {}
    }
}
</script>
<style lang = "scss" scoped>
.station-detail {
    width: calc(100% - 40px);
    .s-contain {
        width: calc(100% - 32px);
        height: 246px;
        padding: 0 0 0 32px;
        background: #121213;
        border-radius: 4px;
        margin-bottom: 28px;
        .item {
            padding: 12px 0;
            display: inline-block;
            width: calc(50% - 16px);
            float: left;
            .label {
                font-size: 1rem;
                color: #929292;
                letter-spacing: 0;
                margin-bottom: 6px;
            }
            .content {
                font-size: 1.875rem;
                color: #FCFCFC;
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
        }
        .barChart {
            height: 30vh;
        }
    }
    /* .tabs-contain {
        width: 100%;
        min-height: 200px;
    } */
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