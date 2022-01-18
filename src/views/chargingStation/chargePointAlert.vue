<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargePointAlert') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        v-model="filter.operatorTypeId"
                        :placeholder="$t('general.operator')">
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
                        :placeholder="$t('chargingStation.chargePointID')+'/'+$t('chargingStation.alert')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @change="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <div class="alertPageComment">{{ alertPageComment }} </div>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="alertCode" :label="$t('chargingStation.alertID')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :min-width="2">
                        <template slot-scope="scope">
                            <Connector v-if="scope.row.connectorIsExistedFlag" :dataObj="scope.row.connectorInfo"></Connector>
                            <span v-else>{{ $t('chargingStation.failure') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alertTitle" :label="$t('chargingStation.alert')" :min-width="3"></el-table-column>
                    <el-table-column prop="sDate" :label="$t('chargingStation.alertTime')" :min-width="3"></el-table-column>
                    <el-table-column prop="workOrderCode" :label="$t('chargingStation.workeOrder')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.workeOrderStatus')" :min-width="2">
                        <template slot-scope="scope">
                            {{ $t('support.workOrderStatus')[scope.row.workOrderStatus] }}
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
import { $HTTP_getChargeAlertList } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
export default {
    components: {
        Connector
    },
    data() {
        return {
            lang: '',
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
            },
            alertPageComment: ''
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {
                lang: this.lang
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
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
            $HTTP_getChargeAlertList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargeAlertList.slice();
                    this.total = this.tableData.length;
                    this.alertPageComment = data.alertPageComment;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.isLoading = false;
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        }
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
    .alertPageComment {
        display: inline-block;
        color: #151E25;
        font-size: 0.875rem;
        line-height: 40px;
    }
}
</style>