<template>
    <div class="table-result">
        <div class="filter">
            <el-select class="select-small" v-model="filter.stopReason" :placeholder="$t('chargingStation.stopReason')" v-loading="allTransactionsReasonList.isLoading" @change="getAllTransactions('filter')" clearable>
                <el-option v-for="item in allTransactionsReasonList.data" :label="item" :key="item" :value="item"></el-option>
            </el-select>
        </div>
        <el-table :data="allTransactions" v-loading="isLoading">
            <el-table-column prop="chargePointId" :label="$t('chargingStation.chargerId')" :min-width="2"></el-table-column>
            <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" :min-width="2"></el-table-column>
            <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" :min-width="2"></el-table-column>
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
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>

    <script>
import { transformUtcToLocTime } from "@/utils/function";
import {
    $HTTP_getAllTransactionsReasonList,
    $HTTP_getAllTransactions
} from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";

export default {
    props: {
        chargerId: String
    },
    data() {
        return {
            allTransactions: [],
            filter: {
                stopReason: ""
            },
            isLoading: false,
            allTransactionsReasonList: {
                data: [],
                isLoading: false
            },
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            page: 1
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        this.getAllTransactions();
        this.getTransactionsReasonList();
    },
    methods: {
        getAllTransactions(type) {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit
            };
            if (this.filter.stopReason) {
                params.StopReason = this.filter.stopReason;
            }
            if (this.chargerId) {
                params.ChargePointId = this.chargerId;
            }
            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }
            $HTTP_getAllTransactions(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.allTransactions = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.allTransactions = [];
                        this.total = 0;
                        // only show empty message if filter is present
                        if (this.filter.stopReason !== "") {
                            this.$message({
                                type: "warning",
                                message: i18n.t("emptyMessage")
                            });
                        }
                    }
                })
                .catch((err) => {
                    this.allTransactions = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getTransactionsReasonList() {
            this.allTransactionsReasonList.isLoading = true;
            $HTTP_getAllTransactionsReasonList()
                .then((res) => {
                    this.allTransactionsReasonList.data = res;
                    this.allTransactionsReasonList.isLoading = false;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        changePage(page) {
            this.page = page;
            this.getAllTransactions();
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
