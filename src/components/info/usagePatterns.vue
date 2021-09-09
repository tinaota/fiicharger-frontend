<template>
    <div class="tab">
        <div class="summary">{{ $t('report.summaryUsagePatterns') }}</div>
        <div class="filter">
            <el-select
                class="select-small"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="fetchData()">
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <el-date-picker
                v-model="filter.dateRange"
                type="daterange"
                value-format="yyyy-MM-dd"
                format="yyyy-MM-dd"
                range-separator="-"
                :start-placeholder="$t('general.startDate')"
                :end-placeholder="$t('general.endDate')"
                :picker-options="pickerOptions"
                :clearable="true"
                @change="fetchData()">
            </el-date-picker>
        </div>
        <div class="info-block">
            <div class="report-border usagePatterns chart-container">
                <div class="label">{{ $t('report.chartUsagePatterns') }}</div>
                <LineChart class="lineChart" :id="'lineChart'" :chartData="chartData"></LineChart>
            </div>
            <div class="report-border usagePatterns statistic">
                <div class="label" style="margin-bottom: 16px;">{{ $t('menu.summary') }}</div>
                <div class="item">
                    <div class="label">{{ $t('report.nChargePoint') }}</div>
                    <div class="msg">{{ 100 }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('chargingStation.powerUsed') }}</div>
                    <div class="msg">
                        {{ "1997.27" }}
                        <span class="unit">kWh</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('chargingStation.chargingDuration') }}</div>
                    <div class="msg">
                        {{ "909.27" }}
                        <span class="unit">hr</span>
                        {{ "42" }}
                        <span class="unit">min</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.avgChargingSession') }}</div>
                    <div class="msg">
                        {{ "10.56" }}
                        <span class="unit">kWh</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.avgChargingDuration') }}</div>
                    <div class="msg">
                        {{ "4" }}
                        <span class="unit">hr</span>
                        {{ "48" }}
                        <span class="unit">min</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.nVehicleConnected') }}</div>
                    <div class="msg">{{ "1124" }}</div>
                </div>
            </div>
        </div>
        <div class="report-border detail">
            <div class="label">{{ $t('general.details') }}</div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)"
                v-loading="isLoading">
                <el-table-column prop="time" :label="$t('report.timeDate')"></el-table-column>
                <el-table-column prop="connectedCount" :label="$t('report.nVehicleConnected')"></el-table-column>
                <el-table-column prop="powerUsage" :label="$t('dashboard.energyUsedUnit')"></el-table-column>
                <el-table-column prop="avgPowerUsage" :label="$t('report.avgEnergyConsumedUnit')"></el-table-column>
            </el-table>
            <div class="total">{{ $t("general.result", {item:total})}}</div>
            <el-pagination background layout="prev, pager, next"
                :total="total"
                :pager-count="5"
                :page-size="10"
                :current-page.sync="page"
                @current-change="changePage">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import { $HTTP_getChargeHistoryAlertList } from "@/api/api";
import LineChart from "@/components/charts/twoLineChart";
import moment from "moment";
export default {
    components: {
        LineChart
    },
    data() {
        return {
            lang: '',
            operatorList: {},
            filter: {
                operatorTypeId: '',
                dateRange: []
            },
            pickerOptions: {
                disabledDate(time) {
                return time.getTime() > Date.now();
                },
            },
            chartData: {},
            isLoading: false,
            tableData: [
                {
                    "time": "00:00 - 01:00",
                    "connectedCount": "0",
                    "powerUsage": "0",
                    "avgPowerUsage": "0"
                },
                {
                    "time": "01:00 - 02:00",
                    "connectedCount": "3",
                    "powerUsage": "2.4",
                    "avgPowerUsage": "2.2"
                },
                {
                    "time": "02:00 - 03:00",
                    "connectedCount": "4",
                    "powerUsage": "9.5",
                    "avgPowerUsage": "9.3"
                },
                {
                    "time": "03:00 - 04:00",
                    "connectedCount": "2",
                    "powerUsage": "3.3",
                    "avgPowerUsage": "3.2"
                },
                {
                    "time": "04:00 - 05:00",
                    "connectedCount": "1",
                    "powerUsage": "2.0",
                    "avgPowerUsage": "2.4"
                },
                {
                    "time": "05:00 - 06:00",
                    "connectedCount": "1",
                    "powerUsage": "1.7",
                    "avgPowerUsage": "1.9"
                },
                {
                    "time": "06:00 - 07:00",
                    "connectedCount": "4",
                    "powerUsage": "12.8",
                    "avgPowerUsage": "13.1"
                },
                {
                    "time": "07:00 - 08:00",
                    "connectedCount": "6",
                    "powerUsage": "16.1",
                    "avgPowerUsage": "15.9"
                },
                {
                    "time": "08:00 - 09:00",
                    "connectedCount": "23",
                    "powerUsage": "35.2",
                    "avgPowerUsage": "38.3"
                },
                {
                    "time": "09:00 - 10:00",
                    "connectedCount": "18",
                    "powerUsage": "20.3",
                    "avgPowerUsage": "22.5"
                },
                {
                    "time": "10:00 - 11:00",
                    "connectedCount": "4",
                    "powerUsage": "9.3",
                    "avgPowerUsage": "9.6"
                },
                {
                    "time": "11:00 - 12:00",
                    "connectedCount": "2",
                    "powerUsage": "3.4",
                    "avgPowerUsage": "2.9"
                },
                {
                    "time": "12:00 - 13:00",
                    "connectedCount": "9",
                    "powerUsage": "9.8",
                    "avgPowerUsage": "9.3"
                },
                {
                    "time": "13:00 - 14:00",
                    "connectedCount": "5",
                    "powerUsage": "5.3",
                    "avgPowerUsage": "6.8"
                },
                {
                    "time": "14:00 - 15:00",
                    "connectedCount": "2",
                    "powerUsage": "2.1",
                    "avgPowerUsage": "2.5"
                },
                {
                    "time": "15:00 - 16:00",
                    "connectedCount": "1",
                    "powerUsage": "0.9",
                    "avgPowerUsage": "1.2"
                },
                {
                    "time": "16:00 - 17:00",
                    "connectedCount": "7",
                    "powerUsage": "8.7",
                    "avgPowerUsage": "9.3"
                },
                {
                    "time": "17:00 - 18:00",
                    "connectedCount": "11",
                    "powerUsage": "13.2",
                    "avgPowerUsage": "15.3"
                },
                {
                    "time": "18:00 - 19:00",
                    "connectedCount": "14",
                    "powerUsage": "15.8",
                    "avgPowerUsage": "14.3"
                },
                {
                    "time": "19:00 - 20:00",
                    "connectedCount": "23",
                    "powerUsage": "27.3",
                    "avgPowerUsage": "29.3"
                },
                {
                    "time": "20:00 - 21:00",
                    "connectedCount": "6",
                    "powerUsage": "7.3",
                    "avgPowerUsage": "6.8"
                },
                {
                    "time": "21:00 - 22:00",
                    "connectedCount": "1",
                    "powerUsage": "4.5",
                    "avgPowerUsage": "3.2"
                },
                {
                    "time": "22:00 - 23:00",
                    "connectedCount": "3",
                    "powerUsage": "6.8",
                    "avgPowerUsage": "7.3"
                },
                {
                    "time": "23:00 - 23:59",
                    "connectedCount": "2",
                    "powerUsage": "3.4",
                    "avgPowerUsage": "3.5"
                }
            ],
            page: 1,
            total: 0
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        const todaySplit = moment().format("YYYY-MM-DD").split('-');
        const thisMonth1st = todaySplit[0] + '-' + todaySplit[1] + '-01';

        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;

        // if (todaySplit[2] === '01') {
        //     this.filter.dateRange = [thisMonth1st, thisMonth1st];
        // } else {
        //     const yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
        //     this.filter.dateRange = [thisMonth1st, yesterday];
        // }
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            // const that = this;
            this.page = 1;
            this.chartData = {
                xList: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00",
                        "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
                        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
                        "21:00", "22:00", "23:00"],
                yList: [
                        {
                            "name": "Energy Consumed",
                            "value": [130,130,130,130,137,142,157,
                                      183,416,693,680,676,578,397,
                                      387,378,313,249,210,177,168,
                                      149,138,131]
                        },
                        {
                            "name": "Vehicle Connected",
                            "value": [0,0,0,0,0,0,5,
                                      57,136,147,143,140,123,97,
                                      93,88,84,73,46,23,12,
                                      8,1,0]
                        }
                ],
            };
            // this.isLoading = true;
            // let param = {
            //     chargeBoxId: this.chargeBoxId
            // };
            // $HTTP_getChargeHistoryAlertList(param).then((data) => {
            //     this.isLoading = false;
            //     if (!!data.success) {
            //         this.tableData = data.chargeAlertList.slice();
                    this.total = this.tableData.length;
            //     } else {
            //         this.tableData = [];
            //         this.total = 0;
            //         this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
            //     }
            // }).catch((err) => {
            //     this.tableData = [];
            //     this.total = 0;
            //     console.log('alert', err)
            //     this.$message({ type: "warning", message: i18n.t("error_network") });
            // });
        },
        changePage(page) {
            this.page = page;
        }
    }
}
</script>
<style lang = "scss" scoped>
.tab {
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>