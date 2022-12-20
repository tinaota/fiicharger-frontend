<template>
    <div class="table-result">
        <el-table :data="tableData" v-loading="isLoading" @expand-change="expandChange">
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-table :data="[tableData[scope.row.index]]">
                        <el-table-column :label="$t('menu.tariff')">
                            <el-table-column :label="$t('general.totalCost')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.total ? scope.row.cost.total.excludingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalCostWithVat')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.total ? scope.row.cost.total.includingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalFixedCost')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.fixed ?scope.row.cost.fixed.excludingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalFixedCostWithVat')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.fixed ?scope.row.cost.fixed.includingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalEnergyCost')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.energy ?scope.row.cost.energy.excludingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalEnergyCostWithVat')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.energy ?scope.row.cost.energy.includingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalTimeCost')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.time ?scope.row.cost.time.excludingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalTimeCostWithVat')" width="130">
                                <template slot-scope="scope">
                                    {{scope.row.cost.time ?scope.row.cost.time.includingVat.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalParkingCost')" width="150">
                                <template slot-scope="scope">
                                    {{scope.row.cost.parking ? scope.row.cost.parking.excludingVat.toFixed(2) : ""}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalParkingCostWithVat')" width="150">
                                <template slot-scope="scope">
                                    {{scope.row.cost.parking ? scope.row.cost.parking.includingVat.toFixed(2) : ""}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalReservationCost')" width="150">
                                <template slot-scope="scope">
                                    {{scope.row.cost.reservation ? scope.row.cost.reservation.excludingVat :''}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.totalReservationCostWithVat')" width="220">
                                <template slot-scope="scope">
                                    {{scope.row.cost.reservation ? scope.row.cost.reservation.includingVat :''}}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>
                    <el-table :data="[tableData[scope.row.index]]">
                        <el-table-column :label="$t('general.sessionDetails')">
                            <el-table-column prop="energyKwh" :label="$t('general.totalEnergy') + '(kWh)'" width="200">
                                <template slot-scope="scope">
                                    {{scope.row.cost.energyKwh ? scope.row.cost.energyKwh.toFixed(2):''}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="totalTime" :label="$t('general.totalTime')" width="150">
                                <template slot-scope="scope">
                                    {{scope.row.cost.totalTimeSec? getConvertedTime(scope.row.cost.totalTimeSec):''}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="totalParkingTime" :label="$t('general.totalParkingTime')" width="200">
                                <template slot-scope="scope">
                                    {{scope.row.cost.parkingTimeSec===0?'0s' :getConvertedTime(scope.row.cost.parkingTimeSec)}}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>
                    <el-table :data="reservationData[scope.row.index]" v-loading="reservationDataIsLoading">
                        <el-table-column :label="$t('chargingStation.reservation')">
                            <el-table-column prop="id" label="ID" width="80"></el-table-column>
                            <el-table-column prop="connectorId" :label="$t('chargingStation.connectorId')" width="150"></el-table-column>
                            <el-table-column prop="idTag" :label="$t('menu.idTag')" width="180"></el-table-column>
                            <el-table-column prop="transactionId" :label="$t('chargingStation.transactionId')" width="150"></el-table-column>
                            <el-table-column prop="status" :label="$t('general.status')" width="160"></el-table-column>
                            <el-table-column :label="$t('chargingStation.startDateTime')" width="250">
                                <template slot-scope="scope">
                                    {{ scope.row.created ? getLocTime(scope.row.created) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.expiryDateTime')" width="250">
                                <template slot-scope="scope">
                                    {{ scope.row.expiryDate ? getLocTime(scope.row.expiryDate) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.cancelledDateTime')" width="250">
                                <template slot-scope="scope">
                                    {{ scope.row.cancelled ? getLocTime(scope.row.cancelled) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.usedDateTime')" width="240">
                                <template slot-scope="scope">
                                    {{ scope.row.used ? getLocTime(scope.row.used) : '' }}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>

                    <el-table :data="transactionData[scope.row.index]" v-loading="transactionDataIsLoading">
                        <el-table-column :label="$t('menu.transaction')">
                            <el-table-column prop="id" label="ID" width="80"></el-table-column>
                            <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" width="100"></el-table-column>
                            <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" width="200"></el-table-column>
                            <el-table-column prop="stopIdTag" :label="$t('chargingStation.stopIdTag')" width="200"></el-table-column>
                            <el-table-column :label="$t('chargingStation.meterStart')+'(KWH)'" width="180">
                                <template slot-scope="scope">
                                    {{ scope.row.meterStart!==null? scope.row.meterStart.toFixed(2) :'' }}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column prop="reservationId" label="Reservation Id" width="200"></el-table-column> -->
                            <el-table-column :label="$t('chargingStation.startTimestamp')" width="200">
                                <template slot-scope="scope">
                                    {{ getLocTime(scope.row.startTimestamp) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.meterStop')+'(KWH)'" width="180">
                                <template slot-scope="scope">
                                    {{ scope.row.meterStop!==null? scope.row.meterStop.toFixed(2):'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.stopTimestamp')" width="200">
                                <template slot-scope="scope">
                                    {{ scope.row.stopTimestamp!==null? getLocTime(scope.row.stopTimestamp):'' }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="stopReason" :label="$t('chargingStation.stopReason')" width="180"></el-table-column>
                            <el-table-column :label="$t('chargingStation.meterTotal')+'(KWH)'" width="180">
                                <template slot-scope="scope">
                                    {{ scope.row.meterTotal!==null? scope.row.meterTotal.toFixed(2) :'' }}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>
                    <el-table :data="cdrData[scope.row.index]" v-loading="cdrDataIsLoading">
                        <el-table-column :label="$t('general.cdr')">
                            <el-table-column prop="status" :label="$t('general.status')" width="80"></el-table-column>
                            <!-- <el-table-column prop="remark" :label="$t('general.remark')" width="80"></el-table-column>
                            <el-table-column prop="invoiceReferenceId" :label="$t('general.invoiceReferenceId')" width="150"></el-table-column> -->
                            <el-table-column prop="isHomeCharging" :label="$t('general.isHomeCharging')" width="80">
                                <template slot-scope="scope">
                                    {{scope.row.isHomeCharging? 'true':'false'}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="modified" :label="$t('general.modified')" width="170">
                                <template slot-scope="scope">
                                    {{ scope.row.modified!==null? getLocTime(scope.row.modified):'' }}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column :label="$t('general.payment')"> -->
                            <el-table-column :label="$t('general.payment') + ' ID'" width="265">
                                <template slot-scope="scope">
                                    {{ scope.row.payment ?scope.row.payment.id:'' }}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column :label="$t('general.cdrId')" width="190">
                                    <template slot-scope="scope">
                                        {{ scope.row.payment ?scope.row.payment.cdrId:'' }}
                                    </template>
                                </el-table-column> -->
                            <el-table-column :label="$t('general.receiptUrl')" width="80">
                                <template slot-scope="scope">
                                    <a v-if="scope.row?.payment?.receiptUrl" :href="scope.row.payment.receiptUrl" target="_blank">{{$t('general.receipt')}}</a>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.paymentStatus')" width="120">
                                <template slot-scope="scope">
                                    {{ scope.row.payment ?scope.row.payment.paymentStatus:'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.canceledAt')" width="170">
                                <template slot-scope="scope">
                                    {{ scope.row.payment ? scope.row.payment.canceledAt? getLocTime(scope.row.payment.canceledAt):'':'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.created')" width="170">
                                <template slot-scope="scope">
                                    {{ scope.row.payment ? scope.row.payment.created? getLocTime(scope.row.payment.created):'':'' }}
                                </template>
                            </el-table-column>
                            <!-- </el-table-column>
                            <el-table-column :label="$t('general.paymentMethod')"> -->
                            <el-table-column :label="$t('general.paymentMethod')+' ID'" width="260">
                                <template slot-scope="scope">
                                    {{ scope.row.payment  && scope.row.payment.paymentMethod?scope.row.payment.paymentMethod.id:'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.cardBrand')" width="120">
                                <template slot-scope="scope">
                                    {{ scope.row.payment  && scope.row.payment.paymentMethod?scope.row.payment.paymentMethod.cardBrand:'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.cardLast4')" width="120">
                                <template slot-scope="scope">
                                    {{ scope.row.payment  && scope.row.payment.paymentMethod?scope.row.payment.paymentMethod.cardLast4:'' }}
                                </template>
                            </el-table-column>
                            <!-- </el-table-column> -->
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="70"></el-table-column>
            <el-table-column prop="idTagValue" :label="$t('menu.idTag')" width="220"></el-table-column>
            <el-table-column prop="authMethod" :label="$t('general.authMethod')" width="190"></el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" width="180"></el-table-column>
            <el-table-column prop="chargeStationName" :label="$t('chargingStation.stationName')" width="180"></el-table-column>
            <el-table-column prop="totalEnergy" :label="$t('general.totalEnergy') + '(kWh)'" width="130">
                <template slot-scope="scope">
                    {{scope.row.cost.energyKwh ? scope.row.cost.energyKwh.toFixed(2):''}}
                </template>
            </el-table-column>
            <el-table-column prop="totalTimeSec" :label="$t('general.totalTime')" width="150">
                <template slot-scope="scope">
                    {{scope.row.cost.totalTimeSec? getConvertedTime(scope.row.cost.totalTimeSec):''}}
                </template>
            </el-table-column>
            <el-table-column prop="totalCost" :label="$t('general.totalCostWithVat')" width="130">
                <template slot-scope="scope">
                    {{scope.row.cost.total ?scope.row.cost.total.includingVat.toFixed(2):''}}
                </template>
            </el-table-column>
            <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" width="200">
                <template slot-scope="scope">
                    {{ scope.row.startTimestamp!==null ?getLocTime(scope.row.startTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" width="200">
                <template slot-scope="scope">
                    {{ scope.row.stopTimestamp!==null ? getLocTime(scope.row.stopTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.status')" width="100">
                <template slot-scope="scope">
                    <el-button type="primary" @click="openDialog(scope.row)">Graph</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
        <SessionsStatusPopup v-if="dialog.visible" :show="dialog.visible" :data="dialog.data" @close="closeDialog()"></SessionsStatusPopup>
    </div>
</template>

<script>
import {
    transformUtcToLocTime,
    transformSecondsToReadableForm
} from "@/utils/function";
import {
    $HTTP_getAllSessionsData,
    $HTTP_getAllReservationById,
    $HTTP_getAllTransactionsById,
    $HTTP_getCDRInfoById
} from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import SessionsStatusPopup from "@/components/popup/sessionsStatusPopup.vue";
export default {
    props: {
        chargerId: String,
        dateRange: Array,
        isUpdateData: Boolean,
        ocppId: String
    },
    emits: ["updated"],
    components: {
        SessionsStatusPopup
    },
    data() {
        return {
            isLoading: false,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            page: 1,
            tableData: [],
            expandedRowsCount: 0,
            reservationData: new Array($GLOBAL_PAGE_LIMIT).fill(null),
            reservationDataIsLoading: false,
            transactionData: new Array($GLOBAL_PAGE_LIMIT).fill(null),
            transactionDataIsLoading: false,
            cdrData: new Array($GLOBAL_PAGE_LIMIT).fill(null),
            cdrDataIsLoading: false,
            dialog: {
                visible: false,
                data: [],
                isLoading: false
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
        getConvertedTime() {
            return (item) => transformSecondsToReadableForm(item);
        }
    },
    watch: {
        dateRange: function () {
            this.getAllSessionsData();
        },
        isUpdateData: function () {
            if (this.isUpdateData) {
                // delay for 2 seconds before fetching
                setTimeout(() => {
                    this.getAllSessionsData();
                }, 2000);
            }
        }
    },
    mounted() {
        this.getAllSessionsData();
    },
    methods: {
        expandChange(row, expanded) {
            // if it is empty or sth is added
            if (
                this.expandedRowsCount === 0 ||
                this.expandedRowsCount < expanded.length
            ) {
                this.getTransactionInfoById(row.transactionId);
                this.getReservationInfoById(row.reservationId);
                this.getCDRInfoById(row.cdrId);
            } else {
                // if reservations is removed
                let remainingReservations;
                if (expanded.length > 0) {
                    remainingReservations = this.tableData.filter((item) =>
                        expanded.some(
                            (expandedItem) =>
                                item.reservationId ===
                                expandedItem.reservationId
                        )
                    );
                    let tempArr = new Array($GLOBAL_PAGE_LIMIT).fill(null);
                    remainingReservations.map((eachReservation) => {
                        let index = this.tableData.findIndex(
                            (item) =>
                                item?.reservationId ===
                                eachReservation?.reservationId
                        );
                        tempArr[index] = this.reservationData[index];
                    });
                    this.reservationData = tempArr;
                } else {
                    this.reservationData = new Array($GLOBAL_PAGE_LIMIT).fill(
                        null
                    );
                }
                // if transactions is removed
                let remainingTransactions;
                if (expanded.length > 0) {
                    remainingTransactions = this.tableData.filter((item) =>
                        expanded.some(
                            (expandedItem) =>
                                item.transactionId ===
                                expandedItem.transactionId
                        )
                    );
                    let tempArr = new Array($GLOBAL_PAGE_LIMIT).fill(null);
                    remainingTransactions.map((eachTransaction) => {
                        let index = this.tableData.findIndex(
                            (item) =>
                                item?.reservationId ===
                                eachTransaction?.reservationId
                        );
                        tempArr[index] = this.transactionData[index];
                    });
                    this.transactionData = tempArr;
                } else {
                    this.transactionData = new Array($GLOBAL_PAGE_LIMIT).fill(
                        null
                    );
                }

                // if cdr is removed
                let remainingCDR;
                if (expanded.length > 0) {
                    remainingCDR = this.tableData.filter((item) =>
                        expanded.some(
                            (expandedItem) => item.cdrId === expandedItem.cdrId
                        )
                    );
                    let tempArr = new Array($GLOBAL_PAGE_LIMIT).fill(null);
                    remainingCDR.map((eachCDR) => {
                        let index = this.tableData.findIndex(
                            (item) => item?.cdrId === eachCDR?.cdrId
                        );
                        tempArr[index] = this.cdrData[index];
                    });
                    this.cdrData = tempArr;
                } else {
                    this.cdrData = new Array($GLOBAL_PAGE_LIMIT).fill(null);
                }
            }
            this.expandedRowsCount = expanded.length;
        },
        getCDRInfoById(id) {
            if (id !== null) {
                let params = { cdrId: id };
                this.cdrDataIsLoading = true;
                $HTTP_getCDRInfoById(params)
                    .then((res) => {
                        let index = this.tableData.findIndex(
                            (item) => item.cdrId === id
                        );
                        let data = [...this.cdrData];
                        data[index] = [res];
                        this.cdrData = data;
                        this.cdrDataIsLoading = false;
                    })
                    .catch((err) => {
                        this.cdrData = [];
                        this.cdrDataIsLoading = false;
                        console.log(err);
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            }
        },
        getTransactionInfoById(id) {
            if (id !== null) {
                let params = { transactionId: id };
                this.transactionDataIsLoading = true;
                $HTTP_getAllTransactionsById(params)
                    .then((res) => {
                        let index = this.tableData.findIndex(
                            (item) => item.transactionId === id
                        );
                        let data = [...this.transactionData];
                        data[index] = [res];
                        this.transactionData = data;
                        this.transactionDataIsLoading = false;
                    })
                    .catch((err) => {
                        this.transactionData = [];
                        this.transactionDataIsLoading = false;
                        console.log(err);
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            }
        },
        getReservationInfoById(id) {
            if (id !== null) {
                let params = { reservationId: id };
                this.reservationDataIsLoading = true;
                $HTTP_getAllReservationById(params)
                    .then((res) => {
                        let index = this.tableData.findIndex(
                            (item) => item.reservationId === id
                        );
                        let data = [...this.reservationData];
                        data[index] = [res];
                        this.reservationData = data;
                        this.reservationDataIsLoading = false;
                    })
                    .catch((err) => {
                        this.reservationData = [];
                        this.reservationDataIsLoading = false;
                        console.log(err);
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            }
        },
        getAllSessionsData() {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit,
                IsDescending: true,
                OrderBy: "Id",
                ChargePointId: this.chargerId,
                StartedAfter: this.dateRange[0],
                StartedBefore: this.dateRange[1]
            };
            $HTTP_getAllSessionsData(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        // set index manually to get rows index above
                        this.tableData = res.data.map((item, index) => {
                            item.index = index;
                            return item;
                        });
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                    this.$emit("updated");
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    this.$emit("updated");
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        changePage(page) {
            this.page = page;
            this.getAllSessionsData();
        },
        openDialog(data) {
            this.dialog.visible = true;
            this.dialog.data = data;
        },
        closeDialog() {
            this.dialog.visible = false;
            this.dialog.data = [];
        }
    }
};
</script>

<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 54px;
        bottom: 66px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5a607f;
        letter-spacing: 0;
    }
}
</style>
