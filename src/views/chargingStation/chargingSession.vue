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
                        :placeholder="$t('chargingStation.chargePointName')"
                        v-loading="chargerBoxList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                    <el-button class="right" icon="el-icon-refresh-right" @click="fetchData()"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')" :min-width="2"></el-table-column>
                    <!-- <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column> -->
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargeBoxName" :label="$t('chargingStation.chargePointName')" :min-width="2"></el-table-column>
                    <el-table-column prop="power" :label="$t('chargingStation.powerUsed')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.billingInfo.powerUsage + 'kWh' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :min-width="2">
                        <template slot-scope="scope">
                            <Connector :dataObj="scope.row.connectorInfo"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column prop="chargingStartTime" :label="$t('general.startTime')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargingEndTime" :label="$t('general.endTime')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.billing')" :min-width="2">
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
                                    <el-table-column prop="power" :label="$t('chargingStation.totalPrice')">
                                        <template slot-scope="scope">
                                            {{ currencyList[scope.row.unitType] + scope.row.price }}
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div slot="reference" class="name-wrapper">{{scope.row.billingInfo.billingCode }}</div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column :label="$t('general.action')" :width="74">
                        <template slot-scope="scope">
                            <el-button class="no-bg" icon="el-icon-data-line" @click="openDialog(scope.row.sessionId)"></el-button>
                        </template>
                    </el-table-column> -->
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
                    v-loading="dialog.isLoading">
                    <div class="sessionDetail">
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointID')}}</div>
                            <div class="info">PHIHONG_HQ_360kW</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargePointName')}}</div>
                            <div class="info">FiiCB27</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.startTime')}}</div>
                            <div class="info">2021-07-07 17:58:00</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.endTime')}}</div>
                            <div class="info">2021-07-07 23:58:00</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargingDuration')}}</div>
                            <div class="info">0h 0m 12s</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.powerUsed')}}</div>
                            <div class="info">{{ "3.502" + "kWh" }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.minOutputPower')}}</div>
                            <div class="info">{{ "146.9" + "kW" }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.maxOutputPower')}}</div>
                            <div class="info">{{ "146.9" + "kW" }}</div>
                        </div>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import ChargingSessionData from "@/tmpData/chargingSessionData";
import { setScrollBar } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import { $HTTP_getChargeBoxListForSelect, $HTTP_getZipCodeListForSelect, $HTTP_getChargingSessionList } from "@/api/api";
export default {
    components: {
        Connector
    },
    data() {
        return {
            operatorList: {
                1: i18n.t('general.all'),
                2: "MidwestFiber",
                3: "APT"
            },
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

                },
                chartData: {}
            }
        }
    },
    mounted() {
        const that = this;
        this.fetchChargerBoxList(()=> {
            that.fetchData();
        });
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
        fetchChargerBoxList(callBack) {
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
                callBack && callBack();
            }).catch((err) => {
                console.log('chargeBoxList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
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
                    this.tableData = data.chargingSessionList.map(item=> {
                        item.chargeBoxName = that.chargerBoxList.data[item.chargeBoxId] || item.chargeBoxId;
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(sessionId) {
            this.dialog.sessionId = sessionId;
            this.dialog.visible = true;
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
    .sessionDetail .item {
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
}
</style>