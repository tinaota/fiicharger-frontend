<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)"
            class="moreCol"
            v-loading="isLoading">
            <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')" :min-width="3"></el-table-column>
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
            <el-table-column v-if="permissionShowBillingAble" :label="$t('general.billingAmt')" :min-width="2">
                <template slot-scope="scope">
                    {{ currencyList[scope.row.billingInfo.unitType] + scope.row.billingInfo.price }}
                </template>
            </el-table-column>
            <el-table-column v-if="permissionShowBillingAble" :label="$t('chargingStation.billingID')" :width="120">
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
            <el-table-column :label="$t('menu.statistics')" :width="88">
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
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import { $HTTP_getChargingSessionList, $HTTP_getChargingSessionDetail} from "@/api/api";
import Connector from "@/components/chargingStation/connector";
import LineChart from "@/components/charts/threeLineChart";
export default {
    props: {
        chargeBoxId: Number
    },
    components: {
        Connector,
        LineChart
    },
    data() {
        return {
            lang: '',
            permissionShowBillingAble: true,
            tableData: [],
            isLoading: false,
            page: 1,
            total: 0,
            currencyList: $GLOBAL_CURRENCY,
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
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user')),
              accPermissionType = userData?.accountInfo?.accPermissionType;
        if (accPermissionType === 4 || accPermissionType === 5) {
            this.permissionShowBillingAble = false;
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {
                chargeBoxInfo: this.chargeBoxId
            };
            $HTTP_getChargingSessionList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargingSessionList.map(item => {
                        item.chargingStartTime = transformUtcToLocTime(item.chargingStartTime);
                        item.chargingEndTime = transformUtcToLocTime(item.chargingEndTime);
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log('session', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
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
                    that.dialog.info.chargingStartTime = transformUtcToLocTime(that.dialog.info.chargingStartTime);
                    that.dialog.info.chargingEndTime = transformUtcToLocTime(that.dialog.info.chargingEndTime);
                    that.dialog.chartData = Object.assign({}, data.chargingChartInfo);
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chargeBoxList', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
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
    }
}
</script>
<style lang = "scss" scoped>
.tab {
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
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
</style>