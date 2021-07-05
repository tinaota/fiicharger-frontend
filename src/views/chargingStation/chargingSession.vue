<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargingSession') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small dark"
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
                        class="select-small dark"
                        v-model="filter.zipCode"
                        :placeholder="$t('general.location')"
                        v-loading="loctionList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="item in loctionList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-select
                        class="select-small dark"
                        v-model="filter.chargeBoxId"
                        :placeholder="$t('chargingStation.chargeBoxID')"
                        v-loading="chargerBoxList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="item in chargerBoxList.data" :label="item.chargeBoxId" :key="item.chargeBoxId" :value="item.chargeBoxId"></el-option>
                    </el-select>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')" :min-width="2"></el-table-column>
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="3"></el-table-column>
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
                1: "Fiicharger",
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
                data: []
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
            }
        }
    },
    mounted() {
        this.fetchData();
        this.fetchLocationList();
        this.fetchChargerBoxList();
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
                if (!!data.success) {
                    this.chargerBoxList.data = data.chargeBoxList.slice();
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
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {
                operatorTypeId: that.filter.operatorTypeId
            };
            if (this.filter.dateRange & this.filter.dateRange.length == 2) {
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
                        item.connectorInfo.status = 0;
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
}
</style>