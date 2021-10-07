<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.support') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.workOrder') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.history') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-tabs v-model="active" @tab-click="handleTabClick">
                    <el-tab-pane :label="$t('menu.summary')" name="summary"></el-tab-pane>
                    <el-tab-pane :label="$t('menu.history')" name="history"></el-tab-pane>
                </el-tabs>
                <div class="filter">
                    <el-select
                        class="select-small"
                        :placeholder="$t('general.operator')"
                        v-model="filter.operatorTypeId"
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
                        :clearable="false"
                        @change="fetchData()">
                    </el-date-picker>
                    <el-select
                        class="select-small"
                        v-model="filter.workOrderStatus"
                        :placeholder="$t('general.type')"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="(item, key) in statusList" :label="item" :key="item" :value="key"></el-option>
                    </el-select>
                    <el-input
                        :placeholder="$t('support.alertName')"
                        v-model="filter.tmpSearch"
                        @fetchData="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    v-loading="isLoading">
                    <el-table-column prop="workOrderCode" :label="$t('support.workerOrderId')" :min-width="5"></el-table-column>
                    <el-table-column prop="type" :label="$t('general.type')" :min-width="4"></el-table-column>
                    <el-table-column prop="alertName" :label="$t('support.alertName')" :min-width="5"></el-table-column>
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="6"></el-table-column>
                    <el-table-column prop="createTime" :label="$t('support.createTime')" :min-width="4"></el-table-column>
                    <el-table-column prop="lastUpdateTime" :label="$t('support.lastUpdateTime')" :min-width="4"></el-table-column>
                    <el-table-column prop="lastUpdateName" :label="$t('support.lastUpdateBy')" :min-width="4"></el-table-column>
                    <el-table-column prop="status" :label="$t('general.status')" :min-width="4"></el-table-column>
                    <el-table-column :label="$t('general.action')" :width="65">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit"></el-button>
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
import HistoryData from "@/tmpData/workOrderHistoryData";
import { setScrollBar } from "@/utils/function";
import { $HTTP_getWorkOrderList } from "@/api/api";
import moment from "moment";
export default {
    data() {
        return {
            lang: '',
            operatorList: {},
            filter: {
                operatorTypeId: '',
                dateRange: [],
                workOrderStatus: '',
                tmpSearch: '',
                search: ''
            },
            statusList: i18n.t('support.workOrderStatus'),
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            active: 'history',
            pickerOptions: {
                disabledDate(time) {
                return time.getTime() > Date.now();
                }
            },
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        const today = moment().format("YYYY-MM-DD");
        this.filter.dateRange = [today, today];
        setScrollBar('.scroll', this);
        this.fetchData();
    },
    methods: {
        fetchData() {
            const that = this;
            this.tableData = HistoryData.workOrderList.map(item => {
                item.status = that.statusList[item.workOrderStatus];
                return item;
            });
            this.total = this.tableData.length;
        },
        changePage(page) {
        },
        handleTabClick(tab, event) {
            if (this.active === 'summary') {
                this.$router.push({ path: "/workOrder/summary" }).catch();
            }
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 12px 28px 28px 28px;
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