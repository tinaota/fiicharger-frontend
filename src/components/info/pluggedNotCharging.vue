<template>
    <div class="tab">
        <div class="summary">{{ $t('report.summaryPluggedNotCharging') }}</div>
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
            <div class="report-border pluggedNotCharging chart-container">
                <div class="label">{{ $t('report.chartPluggedNotCharging') }}</div>
                <BarChart class="barChart" :id="'barChart'" :chartData="chartData"></BarChart>
            </div>
            <div class="report-border pluggedNotCharging statistic">
                <div class="label" style="margin-bottom: 16px;">{{ $t('menu.summary') }}</div>
                <div class="item">
                    <div class="label">{{ $t('report.nChargePoint') }}</div>
                    <div class="msg">{{ chargingUseSummary.chargeBoxCount }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('dashboard.nSession') }}</div>
                    <div class="msg">{{ chargingUseSummary.sessionCount }}</div>
                </div>
            </div>
        </div>
        <div class="report-border detail" v-loading="isLoading">
            <div class="label">{{ $t('general.details') }}</div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)">
                <el-table-column prop="date" :label="$t('general.day')"></el-table-column>
                <el-table-column prop="chargingDuration" :label="$t('report.connectedCharging')"></el-table-column>
                <el-table-column prop="connectedDuration" :label="$t('report.totalConnectedTime')"></el-table-column>
                <el-table-column prop="chargingPercentage" :label="$t('report.connectedChargingTime')"></el-table-column>
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
import { $HTTP_getChargingTimeAnalysisInfo } from "@/api/api";
import BarChart from "@/components/charts/barChart";
import moment from "moment";
import { transformLocTimeToUtc, transformUtcToLocTime } from "@/utils/function";
const DATE_FORMATE = "YYYY-MM-DD";
export default {
    components: {
        BarChart
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
            chartData: {
                xList: [],
                yList: [],
                unit: '(%)'
            },
            chargingUseSummary: {
                sessionCount: 0,
                chargeBoxCount: 0
            },
            tableData: [],
            page: 1,
            total: 0
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        const today = moment().format(DATE_FORMATE);
        // const thisMonth1st = todaySplit[0] + '-' + todaySplit[1] + '-01';
        const thisMonth1st = moment().startOf('month').format(DATE_FORMATE);
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;

        if (today === thisMonth1st) {
            this.filter.dateRange = [thisMonth1st, thisMonth1st];
        } else {
            const yesterday = moment().subtract(1, 'days').format(DATE_FORMATE);
            this.filter.dateRange = [thisMonth1st, yesterday];
        }
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            // 目前呈現UTC時間
            const that = this;
            let param = {
                operatorTypeId: this.filter.operatorTypeId
            };
            if (this.filter.dateRange && this.filter.dateRange.length == 2) {
                // var eDate = moment(this.filter.dateRange[1]).endOf('day').format();
                // param.sDate = transformLocTimeToUtc(this.filter.dateRange[0]);
                // param.eDate = transformLocTimeToUtc(eDate);
                param.sDate = this.filter.dateRange[0];
                param.eDate = this.filter.dateRange[1];
            }
            this.page = 1;
            this.isLoading = true;
            $HTTP_getChargingTimeAnalysisInfo(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    data.chargingUsePercentageChartInfo.xList = data.chargingUsePercentageChartInfo.xList.map(time => transformUtcToLocTime(time, DATE_FORMATE));
                    this.chargingUseSummary = Object.assign({}, data.chargingUseSummary);
                    this.chartData = Object.assign({unit: '(%)'}, data.chargingUsePercentageChartInfo);
                    this.tableData = data.chargingUsePercentagDetail.map((item=> {
                        // item.date = transformUtcToLocTime(item.date, DATE_FORMATE);
                        return item;
                    }));
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