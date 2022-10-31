<template>
    <div class="table-result">
        <el-table :data="tableData" v-loading="isLoading" @expand-change="expandChange">
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-table :data="reservationData[scope.row.index]" v-loading="reservationDataIsLoading">
                        <el-table-column :label="$t('chargingStation.reservation')">
                            <el-table-column prop="id" label="ID" :min-width="1"></el-table-column>
                            <el-table-column prop="connectorId" :label="$t('chargingStation.connectorId')" :min-width="2"></el-table-column>
                            <el-table-column prop="idTag" :label="$t('menu.idTag')" :min-width="2"></el-table-column>
                            <el-table-column prop="transactionId" :label="$t('chargingStation.transactionId')" :min-width="2"></el-table-column>
                            <el-table-column prop="status" :label="$t('general.status')" :min-width="2"></el-table-column>
                            <el-table-column :label="$t('chargingStation.startDateTime')" :min-width="3">
                                <template slot-scope="scope">
                                    {{ scope.row.created ? getLocTime(scope.row.created) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.expiryDateTime')" :min-width="3">
                                <template slot-scope="scope">
                                    {{ scope.row.expiryDate ? getLocTime(scope.row.expiryDate) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.cancelledDateTime')" :min-width="3">
                                <template slot-scope="scope">
                                    {{ scope.row.cancelled ? getLocTime(scope.row.cancelled) : '' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.usedDateTime')" :min-width="3">
                                <template slot-scope="scope">
                                    {{ scope.row.used ? getLocTime(scope.row.used) : '' }}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>

                    <el-table :data="transactionData[scope.row.index]" v-loading="transactionDataIsLoading">
                        <el-table-column :label="$t('menu.transaction')">
                            <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                            <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" :min-width="2"></el-table-column>
                            <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" :min-width="2"></el-table-column>
                            <el-table-column prop="stopIdTag" :label="$t('chargingStation.stopIdTag')" :min-width="2"></el-table-column>
                            <el-table-column :label="$t('chargingStation.meterStart')+'(KWH)'" :min-width="2">
                                <template slot-scope="scope">
                                    {{ scope.row.meterStart!==null? scope.row.meterStart.toFixed(2) :'' }}
                                </template>
                            </el-table-column>
                            <!-- <el-table-column prop="reservationId" label="Reservation Id" :min-width="2"></el-table-column> -->
                            <el-table-column :label="$t('chargingStation.startTimestamp')" :min-width="2">
                                <template slot-scope="scope">
                                    {{ getLocTime(scope.row.startTimestamp) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.meterStop')+'(KWH)'" :min-width="2">
                                <template slot-scope="scope">
                                    {{ scope.row.meterStop!==null? scope.row.meterStop.toFixed(2):'' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.stopTimestamp')" :min-width="2">
                                <template slot-scope="scope">
                                    {{ scope.row.stopTimestamp!==null? getLocTime(scope.row.stopTimestamp):'' }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="stopReason" :label="$t('chargingStation.stopReason')" :min-width="2"></el-table-column>
                            <el-table-column :label="$t('chargingStation.meterTotal')+'(KWH)'" :min-width="2">
                                <template slot-scope="scope">
                                    {{ scope.row.meterTotal!==null? scope.row.meterTotal.toFixed(2) :'' }}
                                </template>
                            </el-table-column>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" :min-width="1"></el-table-column>
            <el-table-column prop="idTagValue" :label="$t('menu.idTag')" :min-width="2"></el-table-column>
            <el-table-column prop="authMethod" :label="$t('general.authMethod')" :min-width="2"></el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" :min-width="2"></el-table-column>
            <el-table-column prop="chargeStationName" :label="$t('chargingStation.stationName')" :min-width="2"></el-table-column>
            <el-table-column prop="reservationId" :label="$t('chargingStation.reservationId')" :min-width="2"></el-table-column>
            <el-table-column prop="transactionId" :label="$t('chargingStation.transactionId')" :min-width="2"></el-table-column>
            <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" :min-width="2">
                <template slot-scope="scope">
                    {{ scope.row.startTimestamp!==null ?getLocTime(scope.row.startTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" :min-width="2">
                <template slot-scope="scope">
                    {{ scope.row.stopTimestamp!==null ? getLocTime(scope.row.stopTimestamp):'' }}
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>

<script>
import { transformUtcToLocTime } from "@/utils/function";
import {
    $HTTP_getAllSessionsData,
    $HTTP_getAllReservationById,
    $HTTP_getAllTransactionsById
} from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";

export default {
    emits: ["updated"],
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
            transactionDataIsLoading: false
        };
    },
    props: {
        chargerId: String,
        dateRange: Array,
        isUpdateData: Boolean,
        ocppId: String
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        this.getAllSessionsData();
        // set empty values to reservation data
        // this.reservationData =
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
    methods: {
        expandChange(row, expanded) {
            // if it is empty or sth is added
            if (
                this.expandedRowsCount === 0 ||
                this.expandedRowsCount < expanded.length
            ) {
                this.getTransactionInfoById(row.transactionId);
                this.getReservationInfoById(row.reservationId);
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
            }
            this.expandedRowsCount = expanded.length;
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
