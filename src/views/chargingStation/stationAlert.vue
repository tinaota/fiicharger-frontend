<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.stationAlert') }}</el-breadcrumb-item>
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
                        :placeholder="$t('chargingStation.chargeBoxID')+'/'+$t('chargingStation.alert')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="handleSearch()">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol">
                    <el-table-column prop="alertId" :label="$t('chargingStation.alertID')"></el-table-column>
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')"></el-table-column>
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')">
                        <template slot-scope="scope">
                            <div v-for="(item, key) in scope.row.connector" :key="key">{{ "("+ key +") "+ item }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alert" :label="$t('chargingStation.alert')"></el-table-column>
                    <el-table-column prop="time" :label="$t('general.time')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.workeOrder')">
                        <template slot-scope="scope">
                            {{ scope.row.workOrder.id }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="workerOrderStatus" :label="$t('chargingStation.workeOrderStatus')"></el-table-column>
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
import StationAlertData from "@/tmpData/stationAlertData";
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
    methods : {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = StationAlertData.stationAlert.slice();
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
                this.tableData = StationAlertData.stationAlert.filter(this.createFilter(this.filter.search));
                this.total = this.tableData.length;
                setScrollBar('.scroll', this);
            } else {
                this.fetchData();
            }
        },
        createFilter(queryString) {
            return (item) => {
                return (item.chargeBoxId.toLowerCase().indexOf(queryString.toLowerCase()) >= 0) ||
                       (item.alert.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
            };
        },
        changePage(page) {
            this.page = page;
        },
        handleDaterange() {}
    },
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