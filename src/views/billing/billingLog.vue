<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.billing') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.billingLog') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        :placeholder="$t('general.operator')"
                        v-model="filter.operatorTypeId"
                        @change="fetchData()"
                        clearable>
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
                    <el-input
                        :placeholder="$t('chargingStation.userID')"
                        v-model="filter.tmpSearch"
                        @change="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    v-loading="isLoading">
                    <el-table-column prop="billingCode" :label="$t('chargingStation.billingID')"></el-table-column>
                    <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="sDate" :label="$t('general.time')"></el-table-column>
                    <el-table-column :label="$t('general.billingAmt')">
                        <template slot-scope="scope">
                            {{ currencyList[scope.row.sessionInfo.unitType] + scope.row.sessionInfo.price }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="power" :label="$t('chargingStation.powerUsed')">
                        <template slot-scope="scope">
                            {{ scope.row.sessionInfo.powerUsage + 'kWh' }}
                        </template>
                    </el-table-column>
                    <!-- <el-table-column prop="stationId" :label="$t('chargingStation.stationID')"></el-table-column> -->
                    <el-table-column prop="billingType" :label="$t('chargingStation.billingType')"></el-table-column>
                    <el-table-column prop="billingStatus" :label="$t('chargingStation.billingStatus')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.sessionID')" :width="148">
                        <template slot-scope="scope">
                            <el-popover trigger="click" popper-class="dark" width="760" placement="left" :offset="-20" :visible-arrow="false">
                                <el-table :data="[scope.row.sessionInfo]">
                                    <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')"></el-table-column>
                                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')"></el-table-column>
                                    <!-- <el-table-column prop="chargeBoxName" :label="$t('chargingStation.chargePointName')"></el-table-column> -->
                                    <el-table-column :label="$t('chargingStation.powerUsed')">
                                        <template slot-scope="scope">
                                            {{ scope.row.powerUsage + 'kWh' }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t('chargingStation.connector')">
                                        <template slot-scope="scope">
                                            <Connector :dataObj="scope.row.connectorInfo"></Connector>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t('general.billingAmt')">
                                        <template slot-scope="scope">
                                            {{ currencyList[scope.row.unitType] + scope.row.price }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="chargingStartTime" :label="$t('general.startTime')"></el-table-column>
                                    <el-table-column prop="chargingEndTime" :label="$t('general.endTime')"></el-table-column>
                                </el-table>
                                <div slot="reference" class="name-wrapper">{{scope.row.sessionInfo.sessionId }}</div>
                            </el-popover>
                        </template>
                    </el-table-column>
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
    </div>
</template>

<script>
import { $HTTP_getBillingList } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import Connector from "@/components/chargingStation/connector";
import { setScrollBar } from "@/utils/function";
export default {
    components: {
        Connector
    },
    data() {
        return {
            lang: '',
            currencyList: $GLOBAL_CURRENCY,
            operatorList: {},
            filter: {
                tmpSearch: '',
                search: '',
                dateRange: [],
                operatorTypeId: ''
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            pickerOptions: {
                disabledDate(time) {
                return time.getTime() > Date.now();
                },
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchData();
    },
    methods: {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {
                lang: this.lang
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.dateRange && this.filter.dateRange.length == 2) {
                param.sDate = this.filter.dateRange[0];
                param.eDate = this.filter.dateRange[1];
            }
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getBillingList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.billingList.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
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
.card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>