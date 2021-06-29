<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/stationList' }">{{ $t('menu.stationList') }}</el-breadcrumb-item>
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
                            <span>{{ curRouteParam.currency + info.avgPrice + "/kWh"}}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                        <div class="content">
                            <span>{{ curRouteParam.parkingRate }}</span>
                        </div>
                    </div>
                </div>
                <div class="chart">
                    <div class="header">{{ $t('chargingStation.chargingSessionAnalysis') }}
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
                            <ChargeBoxList :stationId="curRouteParam.stationId"></ChargeBoxList>
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                            <ChargingSession :tableData="chargingSessionData"></ChargingSession>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="()=> {this.mapDialog.visible=false}" ></ShowPostion>
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
            info: {
                chargeBoxNum: 0,
                chargeSessionNum: 0,
                powerUsed: 0,
                avgPrice: 0
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
            chargingSessionData: [],
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
            if (temp && temp.stationId && temp.stationName && temp.loc
                && temp.loc.lon && temp.loc.lat && temp.countryCode
                && temp.phone && temp.serviceStartTime && temp.serviceEndTime
                && temp.currency && temp.parkingRate && temp.address) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
    },
    mounted() {
        this.fetchData();

    },
    destroyed() {
        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods : {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let data = Object.assign({}, StationDetailData);
            this.getChartSesstionData();
            this.getChartPowerUsedData();
            this.info = data.info;
            this.chargingSessionData = data.chargingSession;
            setScrollBar('.scroll', this);
        },
        handleShowDialog() {
            this.mapDialog.itemId = this.curRouteParam.stationId;
            this.mapDialog.position = this.curRouteParam.loc;
            this.mapDialog.visible = true;
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