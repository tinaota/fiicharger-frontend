<template>
    <div class="table-result">
        <div class="filter">
            <el-select class="select-small" v-model="filter.stopReason" :placeholder="$t('chargingStation.stopReason')" v-loading="allTransactionsReasonList.isLoading" @change="getAllTransactions('filter')" clearable>
                <el-option v-for="item in allTransactionsReasonList.data" :label="item" :key="item" :value="item"></el-option>
            </el-select>
        </div>
        <el-table :data="allTransactions" v-loading="isLoading">
            <el-table-column prop="id" label="ID" width="40"></el-table-column>
            <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" width="120"></el-table-column>
            <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" width="200"></el-table-column>
            <el-table-column prop="stopIdTag" :label="$t('chargingStation.stopIdTag')" width="200"></el-table-column>
            <el-table-column :label="$t('chargingStation.meterStart')+' (kWh)'" width="120">
                <template slot-scope="scope">
                    {{ scope.row.meterStart!==null? scope.row.meterStart.toFixed(2) :'' }}
                </template>
            </el-table-column>
            <!-- <el-table-column prop="reservationId" label="Reservation Id" width="200"></el-table-column> -->
            <el-table-column :label="$t('chargingStation.startTimestamp')" width="180">
                <template slot-scope="scope">
                    {{ getLocTime(scope.row.startTimestamp) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.meterStop')+' (kWh)'" width="120">
                <template slot-scope="scope">
                    {{ scope.row.meterStop!==null? scope.row.meterStop.toFixed(2):'' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.stopTimestamp')" width="180">
                <template slot-scope="scope">
                    {{ scope.row.stopTimestamp!==null? getLocTime(scope.row.stopTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopReason" :label="$t('chargingStation.stopReason')" width="120"></el-table-column>
            <el-table-column :label="$t('chargingStation.meterTotal')+' (kWh)'" width="120">
                <template slot-scope="scope">
                    {{ scope.row.meterTotal!==null? scope.row.meterTotal.toFixed(2) :'' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.chargingProfile')" width="200">
                <template slot-scope="scope">
                    <el-button type="primary" class="actionFunction" v-if="scope.row.stopTimestamp===null" @click="openDialog('addChargingProfile', scope.row)">{{ $t('general.add') }}</el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('menu.transaction')" width="200">
                <template slot-scope="scope">
                    <el-button type="primary" class="actionFunction" v-if="scope.row.stopTimestamp===null" @click="openDialog('stopTransactionWithTransactionId', scope.row)">{{ $t('general.stop') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
        <AddChargingProfile :show="addChargingProfile.visible" :data="addChargingProfile.data" :connectorIdFromTransactions="addChargingProfile.connectorId" @close="isUpdate => { closeDialog('addChargingProfile', isUpdate) }"></AddChargingProfile>
        <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :rowData="commonpopup.rowData" :chargePointId="commonpopup.chargePointId" :action="commonpopup.action" @close="isUpdate => closeDialog('stopTransactionWithTransactionId', isUpdate)"></CommonPopup>
    </div>
</template>

    <script>
import { transformUtcToLocTime } from "@/utils/function";
import {
    $HTTP_getAllTransactionsReasonList,
    $HTTP_getAllTransactions
} from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import AddChargingProfile from "@/components/chargingStation/addChargingProfile";
import CommonPopup from "@/components/commonPopup";

export default {
    components: {
        AddChargingProfile,
        CommonPopup
    },
    props: {
        chargerId: String,
        dateRange: Array,
        isUpdateData: Boolean,
        ocppId: String
    },
    emits: ["updated"],
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
            page: 1,
            isUpDateChargingProfileData: true,
            addChargingProfile: {
                visible: false,
                data: {},
                connectorId: null
            },
            commonpopup: {
                show: false,
                chargePointId: null,
                action: "",
                rowData: {}
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    watch: {
        dateRange: function () {
            this.getAllTransactions();
        },
        isUpdateData: function () {
            if (this.isUpdateData) {
                // delay for 5 seconds before fetching
                setTimeout(() => {
                    this.getAllTransactions();
                }, 5000);
            }
        }
    },
    mounted() {
        this.getAllTransactions();
        this.getTransactionsReasonList();
    },
    methods: {
        openDialog(action, data) {
            if (action === "addChargingProfile") {
                this.addChargingProfile.data = {
                    chargePointId: data.chargePointId,
                    transactionId: data.id,
                    ocppId: this.ocppId
                };
                this.addChargingProfile.connectorId = data.connectorId;
                this.addChargingProfile.visible = true;
            } else if (action === "stopTransactionWithTransactionId") {
                this.commonpopup.show = true;
                this.commonpopup.chargePointId = data.chargePointId;
                this.commonpopup.action = action;
                if (data) {
                    this.commonpopup.rowData = data;
                }
            }
        },
        getAllTransactions(type) {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit,
                IsDescending: true,
                OrderBy: "startTimestamp",
                ChargePointId: this.chargerId,
                StartedAfter: this.dateRange[0],
                StartedBefore: this.dateRange[1]
            };
            if (this.filter.stopReason) {
                params.StopReason = this.filter.stopReason;
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
                    this.$emit("updated");
                })
                .catch((err) => {
                    this.allTransactions = [];
                    this.total = 0;
                    console.log(err);
                    this.$emit("updated");
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
        },
        closeDialog(type, data) {
            if (type === "addChargingProfile") {
                this.addChargingProfile.visible = false;
                this.isUpDateChargingProfileData = data;
            } else if (type === "stopTransactionWithTransactionId") {
                this.commonpopup.show = false;
                this.commonpopup.chargePointId = null;
                this.commonpopup.action = "";
                this.commonpopup.rowData = {};
            }
            data && this.getAllTransactions();
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
