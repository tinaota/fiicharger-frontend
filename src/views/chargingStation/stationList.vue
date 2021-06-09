<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.stationList') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input
                        :placeholder="$t('chargingStation.stationID')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="handleSearch()">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol enable-row-click"
                    @row-click="handleRowClick">
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="1"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="1"></el-table-column>
                    <el-table-column prop="location" :label="$t('general.location')" :min-width="2"></el-table-column>
                    <el-table-column prop="sDate" :label="$t('general.latestModification')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.connector#')" :min-width="2">
                        <el-table-column v-for="item in connectorKey" :key="item" :label="item" :min-width="1">
                            <template slot-scope="scope">{{ scope.row.connector[item] }}</template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column v-for="item in electricityRateKey" :key="item" :label="item" :min-width="1">
                            <template slot-scope="scope">{{ scope.row.electricityRate[item] }}</template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" :min-width="2">
                        <template slot-scope="scope">
                            <el-button @click="openDialog(1, scope.row)">{{ $t('general.modify') }}</el-button>
                            <el-button @click="deleteStation(scope.row.stationId)">{{ $t('general.delete') }}</el-button>
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
            <el-dialog
                :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
                width="600px"
                :visible.sync="dialog.visible"
                :show-close="false">
                <div class="vertial formVertical">
                    <div class="form-item" v-if="dialog.type">
                        <div class="label">{{ $t('chargingStation.stationID') }}</div>
                        <el-input v-model="dialog.info.stationId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.stationName') }}</div>
                        <el-input v-model="dialog.info.stationName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.electricityRateId">
                            <el-option v-for="item in dialog.electricityRateList" :label="item.rateId+' '+item.rateName" :key="item.rateId" :value="item.rateId"></el-option>
                        </el-select>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateStation">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import StationListData from "@/tmpData/stationListData";
import { setScrollBar } from "@/utils/function";
import moment from "moment";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: ''
            },
            tableData: [],
            page: 1,
            total: 0,
            connectorKey: [],
            electricityRateKey: [],
            dialog: {
                visible: false,
                type: 0,
                info: {
                    stationId: '',
                    stationName: '',
                    electricityRateId: ''
                },
                electricityRateList: []
            }
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = StationListData.stationList.slice();
            this.connectorKey = StationListData.connectorKey.slice();
            this.electricityRateKey = StationListData.electricityRateKey.slice();
            this.dialog.electricityRateList = StationListData.electricityRateList.slice();
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
                this.tableData = StationListData.stationList.filter(this.createFilter(this.filter.search));
                this.total = this.tableData.length;
                setScrollBar('.scroll', this);
            } else {
                this.fetchData();
            }
        },
        createFilter(queryString) {
            return (item) => {
                return (item.stationId.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
            };
        },
        changePage(page) {
            this.page = page;
        },
        handleRowClick(row) {
            const stationData = {
                stationId: row.stationId,
                stationName: row.stationName,
                location: row.location
            }
            window.sessionStorage.setItem('fiics-stationInfo', JSON.stringify(stationData));
            this.$router.push({ name: "stationListDetail", params: stationData }).catch();
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            this.$jQuery(".vertial.formVertical").length > 0 && this.$jQuery(".vertial.formVertical").mCustomScrollbar('destroy');
            if (type) {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
            that.$nextTick(() => {
                setScrollBar('.vertial.formVertical', that);
            });
        },
        deleteStation(id) {
            this.tableData = this.tableData.filter(item => item.stationId !== id);
            this.total = this.tableData.length;
        },
        updateStation() {
            if (!this.dialog.type) {
                let data = Object.assign({}, this.dialog.info);
                data.stationId = "C00000" + (this.tableData.length + 1);
                data.location = '';
                data.sDate = moment().format("YYYY/MM/DD HH:mm:ss");
                data.connector= { "AC": 0, "DC": 0 };
                data.electricityRate = {
                    "AC On-Pick": "$0.3/kWh",
                    "AC Off-Pick": "$0.1/kWh",
                    "DC On-Pick": "$3/kWh",
                    "DC Off-Pick": "$1/kWh"
                };
                this.tableData.push(data);
            } else {
                let tmp = [];
                this.tableData.forEach(item => {
                    if(item.id === this.dialog.info.id) {
                        item = Object.assign(item, this.dialog.info);
                    }
                    tmp.push(item);
                });
                this.tableData = tmp;
            }
            this.dialog.visible = false;
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