<template>
    <div class="scroll">
        <div class="mainctrl dashboard-statistics">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.statistics') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <br/>
            <el-select
                class="select-small large"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="fetchAllData">
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <br/>
            <div class="card-8 statistics">
                <div class="header" style="height: auto; line-height: 1">
                    <!-- <el-select
                        class="select-small"
                        style="vertical-align: top;"
                        v-model="statistics.filter"
                        @change="handleSelected()">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select> -->
                    <div class="filter horizontal alignItemCenter" style="margin-bottom: 0">
                      <p class="mr-10">{{ $t('menu.statistics') }}</p>
                      <el-date-picker
                          v-model="statistics.filter"
                          type="daterange"
                          value-format="yyyy-MM-dd"
                          format="yyyy-MM-dd"
                          range-separator="-"
                          :start-placeholder="$t('general.startDate')"
                          :end-placeholder="$t('general.endDate')"
                          :picker-options="pickerOptions"
                          :clearable="false"
                          @change="handleSelected()">
                      </el-date-picker>
                    </div>
                </div>
                <div class="s-contain">
                    <div class="item">
                        <div class="label">{{ $t('general.billing') }}</div>
                        <div class="content">
                            <span>{{ "$" + new Intl.NumberFormat('en-IN').format(statistics.data.price) }}</span>
                            <!-- <i v-if="statistics.data.priceRate>0" class="el-icon-top"><span> {{ statistics.data.priceRate }}% </span></i>
                            <i v-else-if="statistics.data.priceRate<0" class="el-icon-bottom"><span>{{ statistics.data.priceRate }}% </span></i>
                            <span v-else class="rate">{{ statistics.data.priceRate }}%</span> -->
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.energyUsedUnit') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.data.powerUsage) }}</span>
                            <!-- <i v-if="statistics.data.powerUsageRate>0" class="el-icon-top"><span>{{ statistics.data.powerUsageRate }}%</span></i>
                            <i v-else-if="statistics.data.powerUsageRate<0" class="el-icon-bottom"><span>{{ statistics.data.powerUsageRate }}%</span></i>
                            <span v-else class="rate">{{ statistics.data.powerUsageRate }}%</span> -->
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nAccount') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.data.accountCount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.nChargePoint') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.data.chargeBoxCount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nSession') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.data.chargingSessionCount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nConnector') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.data.chargeConnectorCount) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.powerUsedTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="powerUsedTop10Day"
                        @change="handleSelected('p10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in powerUsedTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.name }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(powerUsedTop10.data[idx].powerUsage) }}</span>
                        </div>
                        <el-progress :class="{'spec': !idx}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.revenueTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="revenueTop10Day"
                        @change="handleSelected('r10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in revenueTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.name }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(revenueTop10.data[idx].price) }}</span>
                        </div>
                        <el-progress :class="{'spec': !idx}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.sessionTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="sessionTop10Day"
                        @change="handleSelected('s10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in sessionTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.name }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(sessionTop10.data[idx].chargingSessionCount) }}</span>
                        </div>
                        <el-progress :class="{'spec': !idx}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <!-- <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.faultsTypeTop5') }}</div>
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in faultsTypeTop5.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.name }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(faultsTypeTop5.data[idx].count) }}</span>
                        </div>
                        <el-progress :class="{'spec': !idx}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div> -->
        </div>
    </div>
</template>
<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_getChargingStatisticsInfo, $HTTP_getPowerUsageTop10List, $HTTP_getRevenueTop10List, $HTTP_getChargingSessionCountTop10List, $HTTP_getFaultCountTop5List } from "@/api/api";
import moment from "moment";
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
export default {
    data() {
        return {
            pickerOptions: {
                disabledDate(time) {
                  return time.getTime() > Date.now();
                },
            },
            lang: '',
            filter: {
                operatorTypeId: ''
            },
            operatorList: {},
            daySelectList: i18n.t('dashboard.daySelectList'),
            statistics: {
                isLoading: false,
                filter: [moment().add(-1, 'years').format(), moment().endOf('days').format()],
                data: {
                    price: 0,
                    priceRate: 0,
                    powerUsage: 0,
                    powerUsageRate: 0,
                    accountCount: 0,
                    chargeBoxCount: 0,
                    chargingSessionCount: 0,
                    chargeConnectorCount: 0
                }
            },
            powerUsedTop10: {
                isLoading: false,
                filter: [moment().add(-1, 'years').format(), moment().endOf('days').format()],
                most: "",
                data: [],
                pData: []
            },
            revenueTop10: {
                isLoading: false,
                filter: [moment().add(-1, 'years').format(), moment().endOf('days').format()],
                most: "",
                data: [],
                pData: []
            },
            sessionTop10: {
                isLoading: false,
                filter: [moment().add(-1, 'years').format(), moment().endOf('days').format()],
                most: "",
                data: [],
                pData: []
            },
            faultsTypeTop5: {
                isLoading: false,
                filter: [moment().add(-1, 'years').format(), moment().endOf('days').format()],
                most: "",
                data: [],
                pData: []
            },
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        this.fetchAllData();
        setScrollBar('.scroll', this);
    },
    methods : {
        fetchAllData() {
            this.fetchChargingStatisticsInfo();
            this.fetchPowerUsedTop10();
            this.fetchRevenueTop10();
            this.fetchSessionTop10();
            // this.fetchFaultsTypeTop5();
        },
        fetchChargingStatisticsInfo() {
            const that = this;
            let param = {
                // dateType: 5,
                startTime: moment(this.statistics.filter[0]).utc().format(dateFormat),
                endTime: moment(this.statistics.filter[1]).utc().format(dateFormat),
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.statistics.isLoading = true;
            $HTTP_getChargingStatisticsInfo(param).then((data) => {
                that.statistics.isLoading = false;
                if (!!data.success) {
                    that.statistics.data = Object.assign({}, data.chargingSessionAnalysisInfo);
                } else {
                    that.statistics.data = {
                                            price: 0,
                                            priceRate: 0,
                                            powerUsage: 0,
                                            powerUsageRate: 0,
                                            accountCount: 0,
                                            chargeBoxCount: 0,
                                            chargingSessionCount: 0,
                                            chargeConnectorCount: 0
                                        };
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('statistics', err);
                that.statistics.data = {
                                        price: 0,
                                        priceRate: 0,
                                        powerUsage: 0,
                                        powerUsageRate: 0,
                                        accountCount: 0,
                                        chargeBoxCount: 0,
                                        chargingSessionCount: 0,
                                        chargeConnectorCount: 0
                                    };
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchPowerUsedTop10() {
            const that = this;
            let param = {
                // dateType: 5,
                startTime: moment(this.powerUsedTop10.filter[0]).utc().format(dateFormat),
                endTime: moment(this.powerUsedTop10.filter[1]).utc().format(dateFormat),
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.powerUsedTop10.isLoading = true;
            $HTTP_getPowerUsageTop10List(param).then((data) => {
                that.powerUsedTop10.isLoading = false;
                if (!!data.success) {
                    that.powerUsedTop10.data = data.powerUsageTop10List.slice();
                } else {
                    that.powerUsedTop10.data = [];
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                that.powerUsedTop10.pData = that.powerUsedTop10.data.length > 0 ? that.addPercentage(that.powerUsedTop10.data, 'chargeBoxName', 'powerUsage') : [];
            }).catch((err) => {
                console.log('powerUsedTop10', err);
                that.powerUsedTop10.data = [];
                that.powerUsedTop10.pData = [];
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchRevenueTop10() {
            const that = this;
            let param = {
                // dateType: 5,
                startTime: moment(this.revenueTop10.filter[0]).utc().format(dateFormat),
                endTime: moment(this.revenueTop10.filter[1]).utc().format(dateFormat),
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.revenueTop10.isLoading = true;
            $HTTP_getRevenueTop10List(param).then((data) => {
                that.revenueTop10.isLoading = false;
                if (!!data.success) {
                    that.revenueTop10.data = data.revenueTop10List.slice();
                } else {
                    that.revenueTop10.data = [];
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                that.revenueTop10.pData = that.revenueTop10.data.length > 0 ? that.addPercentage(that.revenueTop10.data, 'chargeBoxName', 'price') : [];
            }).catch((err) => {
                console.log('revenueTop10', err);
                that.revenueTop10.data = [];
                that.revenueTop10.pData = [];
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchSessionTop10() {
            const that = this;
            let param = {
                // dateType: 5,
                startTime: moment(this.sessionTop10.filter[0]).utc().format(dateFormat),
                endTime: moment(this.sessionTop10.filter[1]).utc().format(dateFormat),
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.sessionTop10.isLoading = true;
            $HTTP_getChargingSessionCountTop10List(param).then((data) => {
                that.sessionTop10.isLoading = false;
                if (!!data.success) {
                    that.sessionTop10.data = data.chargingSessionCountTop10List.slice();
                } else {
                    that.sessionTop10.data = [];
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                that.sessionTop10.pData = that.sessionTop10.data.length > 0 ? that.addPercentage(that.sessionTop10.data, 'chargeBoxName', 'chargingSessionCount') : [];
            }).catch((err) => {
                console.log('sessionTop10', err);
                that.sessionTop10.data = [];
                that.sessionTop10.pData = [];
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchFaultsTypeTop5() {
            const that = this;
            let param = {
                dateType: this.faultsTypeTop5.filter
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.faultsTypeTop5.isLoading = true;
            $HTTP_getFaultCountTop5List(param).then((data) => {
                that.faultsTypeTop5.isLoading = false;
                if (!!data.success) {
                    that.faultsTypeTop5.data = data.faultCountTop5List.slice();
                } else {
                    that.faultsTypeTop5.data = [];
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                that.faultsTypeTop5.pData = that.faultsTypeTop5.data.length > 0 ? that.addPercentage(that.faultsTypeTop5.data, 'name', 'count') : [];
            }).catch((err) => {
                console.log('faultsTypeTop5', err);
                that.faultsTypeTop5.data = [];
                that.faultsTypeTop5.pData = [];
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        addPercentage(data, name, val) {
            let pData = [];
            const basicP = (data[0][val] == 0) ? 100 : Math.round(data[0][val]*10/0.9)/10;
            data.forEach(info => {
                pData.push({
                    name: info[name],
                    val: Math.round(info[val] * 100 / basicP)
                })
            });
            return pData;
        },
        handleSelected() {
            const tmp = [this.statistics.filter[0], moment(this.statistics.filter[1]).endOf('days').format()];
            this.statistics.filter = tmp;
            this.powerUsedTop10.filter = tmp;
            this.revenueTop10.filter = tmp;
            this.sessionTop10.filter = tmp;
            this.faultsTypeTop5.filter = tmp;
            this.fetchAllData();
        }
    }
}
</script>
<style lang = "scss" scoped>
.statistics {
    width: calc(100% - 40px);
    .header {
        height: 28px;
        line-height: 28px;
    }
    .s-contain {
        width: calc(100% - 18px);
        padding: 0 0 0 18px;
        .item {
            padding: 16px 0 8px 0;
            display: inline-block;
            width: calc(33.33% - 6px);
            float: left;
            .label {
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
                margin-bottom: 4px;
            }
            .content {
                font-size: 1.875rem;
                /* color: #151E25; */
                color: #1E90FF;
                letter-spacing: 0;
                i {
                    /* margin-left: 12px; */
                    font-size: 1rem;
                    &.el-icon-top {
                        color: #FD2D55;
                    }
                    &.el-icon-bottom {
                        color: #33C85A;
                    }
                }
                .rate {
                    font-size: 1rem;
                    color: #525E69;
                    margin-left: 16px;
                }
            }
        }
    }
}
.rank-area {
    /* 4個 */
    /*width: calc(25% - 40px - 9px);
    margin-right: 12px; */
    /* 3個 */
    width: calc(33.05% - 40px - 8px);
    margin-right: 12px;
    height: 600px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    &:nth-child(4n+1) {
        margin-right: 0px;
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
                height: 20px;
                line-height: 20px;
                font-size: 1rem;
                .name {
                    display: inline-block;
                    color: #525E69;
                }
                .num {
                    display: inline-block;
                    float: right;
                    color: #525E69;
                }
            }
        }
    }
}
@media (min-width: 1251px) {
    .statistics .s-contain .item {
        width: calc(16.667% - 3px);
    }
}
</style>