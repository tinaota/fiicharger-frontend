<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargingSession') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
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
                        @change="fetchData()">
                    </el-date-picker>
                    <el-select
                        class="select-small"
                        v-model="filter.zipCode"
                        :placeholder="$t('general.location')"
                        v-loading="loctionList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="item in loctionList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-select
                        class="select-small"
                        v-model="filter.chargeBoxId"
                        :placeholder="$t('chargingStation.chargePointID')"
                        v-loading="chargerBoxList.isLoading"
                        @change="fetchData()"
                        clearable
                        style="width: 280px">
                        <el-option v-for="(item, key) in chargerBoxList.data" :label="key" :key="key" :value="key"></el-option>
                    </el-select>
                    <el-button class="right" icon="el-icon-refresh-right" @click="fetchData()"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')" :min-width="3"></el-table-column>
                    <!-- <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column> -->
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="4"></el-table-column>
                    <el-table-column prop="power" :label="$t('chargingStation.powerUsed')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.billingInfo.powerUsage + 'kWh' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :min-width="3">
                        <template slot-scope="scope">
                            <Connector :dataObj="scope.row.connectorInfo"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column prop="chargingStartTime" :label="$t('general.startTime')" :min-width="3"></el-table-column>
                    <el-table-column prop="chargingEndTime" :label="$t('general.endTime')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('general.billingAmt')" :min-width="2">
                        <template slot-scope="scope">
                            {{ currencyList[scope.row.billingInfo.unitType] + scope.row.billingInfo.price }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.billingID')" :width="120">
                        <template slot-scope="scope">
                            <el-popover trigger="click" popper-class="dark" width="420" placement="left" :offset="-20" :visible-arrow="false">
                                <el-table :data="[scope.row.billingInfo]">
                                    <el-table-column prop="billingCode" :label="$t('chargingStation.billingID')"></el-table-column>
                                    <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
                                    <el-table-column :label="$t('chargingStation.powerUsed')">
                                        <template slot-scope="scope">
                                            {{ scope.row.powerUsage + 'kWh' }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="power" :label="$t('general.billingAmt')">
                                        <template slot-scope="scope">
                                            {{ currencyList[scope.row.unitType] + scope.row.price }}
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div slot="reference" class="name-wrapper">{{scope.row.billingInfo.billingCode }}</div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" :width="65">
                        <template slot-scope="scope">
                            <el-button class="no-bg" icon="el-icon-data-line" @click="openDialog(scope.row.sessionId)"></el-button>
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
                <el-dialog
                    :title="dialog.sessionId"
                    width="80%"
                    :visible.sync="dialog.visible"
                    :show-close="false"
                    @close="closeDialog()">
                    <div class="sessionDetail"
                        v-loading="dialog.isLoading">
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointID')}}</div>
                            <div class="info">{{ dialog.info.chargeBoxId }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointName')}}</div>
                            <div class="info">{{ dialog.info.chargeBoxName }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.startTime')}}</div>
                            <div class="info">{{ dialog.info.chargingStartTime }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.endTime')}}</div>
                            <div class="info">{{ dialog.info.chargingEndTime }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargingDuration')}}</div>
                            <div class="info">{{ dialog.info.chargingDuration }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.powerUsed')}}</div>
                            <div class="info">{{ dialog.info.powerUsage + "kWh" }}</div>
                        </div>
                        <!-- <div class="item">
                            <div class="label">{{ $t('chargingStation.minOutputPower')}}</div>
                            <div class="info">{{ dialog.info.minOutputPower + "kW" }}</div>
                        </div> -->
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.maxOutputPower')}}</div>
                            <div class="info">{{ dialog.info.maxOutputPower + "kW" }}</div>
                        </div>
                        <LineChart class="lineChart" :id="dialog.sessionId" :chartData="dialog.chartData"></LineChart>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { setScrollBar } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import LineChart from "@/components/charts/threeLineChart";
import { $HTTP_getChargeBoxListForSelect, $HTTP_getZipCodeListForSelect, $HTTP_getChargingSessionList, $HTTP_getChargingSessionDetail } from "@/api/api";
export default {
    components: {
        Connector,
        LineChart
    },
    data() {
        return {
            lang: '',
            operatorList: {},
            filter: {
                operatorTypeId: '',
                dateRange: [],
                chargeBoxId: '',
                zipCode: ''
            },
            chargerBoxList: {
                isLoading: false,
                data: {}
            },
            loctionList: {
                isLoading: false,
                data: []
            },
            currencyList: $GLOBAL_CURRENCY,
            isLoading: true,
            tableData: [],
            page: 1,
            total: 0,
            pickerOptions: {
                disabledDate(time) {
                return time.getTime() > Date.now();
                }
            },
            dialog: {
                visible: false,
                isLoading: false,
                sessionId: '',
                info: {
                    chargeBoxId: '',
                    chargeBoxName: '',
                    chargingStartTime: '',
                    chargingEndTime: '',
                    chargingDuration: '',
                    minOutputPower: '',
                    maxOutputPower: '',
                    powerUsage: ''
                },
                chartData: {}
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchChargerBoxList();
        this.fetchData();
        this.fetchLocationList();
    },
    methods: {
        fetchLocationList() {
            const that = this;
            this.loctionList.isLoading = true;
            $HTTP_getZipCodeListForSelect().then((data) => {
                this.loctionList.isLoading = false;
                if (!!data.success) {
                    this.loctionList.data = data.zipCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('loctionList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchChargerBoxList() {
            const that = this;
            this.chargerBoxList.isLoading = true;
            $HTTP_getChargeBoxListForSelect().then((data) => {
                this.chargerBoxList.isLoading = false;
                this.chargerBoxList.data = {};
                if (!!data.success) {
                    data.chargeBoxList.forEach(item => {
                        this.chargerBoxList.data[item.chargeBoxId] = item.chargeBoxName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chargeBoxList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.dateRange && this.filter.dateRange.length == 2) {
                param.sDate = this.filter.dateRange[0];
                param.eDate = this.filter.dateRange[1];
            }
            if (this.filter.chargeBoxId) {
                param.chargeBoxId = this.filter.chargeBoxId;
            }
            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }
            $HTTP_getChargingSessionList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargingSessionList.slice();
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
        fetchChargingSessionDetail() {
            const that = this;
            let param = {
                sessionId: this.dialog.sessionId,
                lang: this.lang
            };
            this.dialog.isLoading = true;
            $HTTP_getChargingSessionDetail(param).then((data) => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.dialog.info = Object.assign({}, data.chargingSessionInfo);
                    that.dialog.chartData = Object.assign({}, data.chargingChartInfo);
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chargeBoxList', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(sessionId) {
            const that = this;
            this.dialog.sessionId = sessionId;
            this.dialog.info = {
                                chargeBoxId: '',
                                chargeBoxName: '',
                                chargingStartTime: '',
                                chargingEndTime: '',
                                chargingDuration: '',
                                minOutputPower: '',
                                maxOutputPower: '',
                                powerUsage: ''
                            };
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            this.$jQuery(".sessionDetail").length > 0 && this.$jQuery(".sessionDetail").mCustomScrollbar('destroy');
            that.$nextTick(() => {
                that.fetchChargingSessionDetail();
                setScrollBar('.sessionDetail', that);
            });
        },
        closeDialog() {
            this.$jQuery(".scroll").mCustomScrollbar("update");
        }
    },
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
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
    .filter .dark.el-select.long {
        width: 280px;
    }
    .sessionDetail {
        max-height: calc(85vh - 50px - 7.5vh - 24px);
        .item {
            display: inline-block;
            width: calc(50% - 4px);
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 200px;
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
            }
            .info {
                display: inline-block;
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151E25;
                letter-spacing: 0;
            }
        }
        .lineChart {
            width: 100%;
            height: 300px;
            position: relative;
        }
    }
}
</style>