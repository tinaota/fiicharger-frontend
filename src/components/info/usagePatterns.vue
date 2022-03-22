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
        <div class="info-block" v-loading="isLoading">
            <div class="report-border usagePatterns chart-container">
                <div class="label">{{ $t('report.chartUsagePatterns') }}</div>
                <LineChart class="lineChart" :id="'lineChart'" :chartData="chartData"></LineChart>
            </div>
            <div class="report-border usagePatterns statistic">
                <div class="label" style="margin-bottom: 16px;">{{ $t('menu.summary') }}</div>
                <div class="item">
                    <div class="label">{{ $t('report.nChargePoint') }}</div>
                    <div class="msg">{{ summary.chargeBoxCount }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('chargingStation.powerUsed') }}</div>
                    <div class="msg">
                        {{ summary.powerUsage }}
                        <span class="unit">kWh</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('chargingStation.chargingDuration') }}</div>
                    <div class="msg">
                        {{ summary.chargingDuration.hour }}
                        <span class="unit">hr</span>
                        {{ summary.chargingDuration.min }}
                        <span class="unit">min</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.avgChargingSession') }}</div>
                    <div class="msg">
                        {{ summary.avgPowerUsage }}
                        <span class="unit">kWh</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.avgChargingDuration') }}</div>
                    <div class="msg">
                        {{ summary.avgChargingDuration.hour }}
                        <span class="unit">hr</span>
                        {{ summary.avgChargingDuration.min }}
                        <span class="unit">min</span>
                    </div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('report.nVehicleConnected') }}</div>
                    <div class="msg">{{ summary.totalConnectedCount }}</div>
                </div>
            </div>
        </div>
        <div class="report-border detail" v-loading="isLoading">
            <div class="label">{{ $t('general.details') }}</div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)">
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
import { $HTTP_getChargingPowerUsageAnalysisInfo } from "@/api/api";
import LineChart from "@/components/charts/twoLineChart";
import moment from "moment";
import { transformLocTimeToUtc, transformUtcToLocTime } from "@/utils/function";
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
            isLoading: false,
            summary: {
                chargeBoxCount: '',
                powerUsage: '',
                chargingDuration: {
                    hour: '00',
                    min: '00'
                },
                avgPowerUsage: '',
                avgChargingDuration: {
                    hour: '00',
                    min: '00'
                },
                totalConnectedCount: ''
            },
            chartData: {
                xList: [],
                yList: []
            },
            tableData: [],
            page: 1,
            total: 0
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        const today = moment().format("YYYY-MM-DD");
        const thisMonth1st = moment().startOf('month').format("YYYY-MM-DD");

        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;

        if (today === thisMonth1st) {
            this.filter.dateRange = [thisMonth1st, thisMonth1st];
        } else {
            const yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
            this.filter.dateRange = [thisMonth1st, yesterday];
        }
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            const that = this;
            let param = {
                operatorTypeId: this.filter.operatorTypeId
            };
            if (this.filter.dateRange && this.filter.dateRange.length == 2) {
                var eDate = moment(this.filter.dateRange[1]).endOf('day').format();
                param.sDate = transformLocTimeToUtc(this.filter.dateRange[0]);
                param.eDate = transformLocTimeToUtc(eDate);
            }
            this.page = 1;
            this.isLoading = true;
            $HTTP_getChargingPowerUsageAnalysisInfo(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    data.chargingPowerUsageChartInfo.xList = data.chargingPowerUsageChartInfo.xList.map(period => that.transformTimePeriod(period));
                    this.summary = Object.assign({}, data.chargingPowerUsageSummary);
                    this.chartData = Object.assign({}, data.chargingPowerUsageChartInfo);
                    this.tableData = data.chargingPowerUsageDetail.map(item => {
                        item.time = that.transformTimePeriod(item.time);
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log('alert', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        transformTimePeriod(period) {
            const time = period.split('~'),
                  today = moment().format("YYYY-MM-DD");
            return transformUtcToLocTime(today+' '+time[0], "HH:mm")+'~'+ transformUtcToLocTime(today+' '+time[1], "HH:mm");
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