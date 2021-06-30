<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.memberAccount') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.billingLog') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-date-picker
                        v-model="filter.dateRange"
                        type="daterange"
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        range-separator="-"
                        :start-placeholder="$t('general.startDate')"
                        :end-placeholder="$t('general.endDate')"
                        :picker-options="pickerOptions"
                        :clearable="false"
                        @change="handleDaterange">
                    </el-date-picker>
                    <el-input
                        :placeholder="$t('chargingStation.userID')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="handleSearch()">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)">
                    <el-table-column prop="userId" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="billingId" :label="$t('chargingStation.billingID')"></el-table-column>
                    <el-table-column prop="billingTime" :label="$t('general.time')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.totalPrice')">
                        <template slot-scope="scope">
                            {{ "$" + scope.row.price }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="power" :label="$t('chargingStation.powerUsed')">
                        <template slot-scope="scope">
                            {{ scope.row.power + 'kWh' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')"></el-table-column>
                    <el-table-column prop="billingType" :label="$t('chargingStation.billingType')"></el-table-column>
                    <el-table-column prop="billingStatus" :label="$t('chargingStation.billingStatus')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.sessionID')" :width="120">
                        <template slot-scope="scope">
                            <el-popover trigger="click" popper-class="dark" width="680" placement="left" :offset="-20" :visible-arrow="false">
                                <el-table :data="[scope.row.sessionInfo]">
                                    <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')"></el-table-column>
                                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')"></el-table-column>
                                    <el-table-column prop="power" :label="$t('chargingStation.powerUsed')">
                                        <template slot-scope="scope">
                                            {{ scope.row.power + 'kWh' }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t('chargingStation.connector')">
                                        <template slot-scope="scope">
                                            <div v-for="(item, key) in scope.row.connector" :key="key">{{ "("+ key +") "+ item }}</div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="$t('chargingStation.billing')">
                                        <template slot-scope="scope">
                                            {{ "$" + scope.row.price }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="sTime" :label="$t('general.startTime')"></el-table-column>
                                    <el-table-column prop="eTime" :label="$t('general.endTime')"></el-table-column>
                                </el-table>
                                <div slot="reference" class="name-wrapper">{{scope.row.sessionId }}</div>
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
import BillingLogData from "@/tmpData/billingLogData";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: '',
                dateRange: [],
            },
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
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = BillingLogData.billingLogData.slice();
            this.page = 1;
            this.total = this.tableData.length;
            setScrollBar('.scroll', this);
        },
        handleSearch() {
            this.filter.search = this.filter.tmpSearch;
            this.page = 1;
            if (this.filter.search) {
                this.tableData = [];
                this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
                this.tableData = BillingLogData.billingLogData.filter(this.createFilter(this.filter.search));
                this.total = this.tableData.length;
                setScrollBar('.scroll', this);
            } else {
                this.fetchData();
            }
        },
        createFilter(queryString) {
            return (item) => {
                return (item.userId.toLowerCase().indexOf(queryString.toLowerCase()) >= 0);
            };
        },
        changePage(page) {
            this.page = page;
        },
        handleDaterange() {}
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