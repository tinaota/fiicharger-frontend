<template>
    <div>
        <el-table :data="tableData" v-loading="isLoading">
            <el-table-column prop="id" :label="$t('chargingStation.reservationId')" :min-width="2"></el-table-column>
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
            <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="65">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.status === 'Accepted' && scope.row.cancelled === null && scope.row.used === null" class="no-bg" @click="openDialog('cancel', scope.row)" style="padding: 4px 8px;">
                        <i class="fa fa-ban" aria-hidden="true" style="color:#1E5EFF; font-size: 24px;"></i>
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
        <CancelReservation :show="cancelDialog.visible" :data="cancelDialog.data" @close="isUpdate => { closeDialog('cancel', isUpdate) }"></CancelReservation>
    </div>
</template>
<script>
import { transformUtcToLocTime } from "@/utils/function";
import { $HTTP_getReservation } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import CancelReservation from "@/components/chargingStation/cancelReservation";
export default {
    components: {
        CancelReservation
    },
    props: {
        chargerId: String,
        isUpdateData: Boolean,
        dateRange: Array
    },
    emits: ["updated"],
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            cancelDialog: {
                visible: false,
                data: {}
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    watch: {
        isUpdateData: {
            handler() {
                if (this.isUpdateData) {
                    // delay for 5 seconds before fetching
                    setTimeout(() => {
                        this.fetchReservations();
                    }, 5000);
                }
            }
        }
    },
    mounted() {
        this.fetchReservations();
    },
    methods: {
        fetchReservations() {
            let params = {
                page: this.page,
                limit: this.limit,
                ChargePointId: this.chargerId,
                IsDescending: true,
                OrderBy: "created",
                CreatedAfter: this.dateRange[0],
                CreatedBefore: this.dateRange[1]
            };
            this.isLoading = true;
            $HTTP_getReservation(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                    this.$emit("updated");
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.tableData = [];
                    this.total = 0;
                    console.log("fetchReservations", err);
                    this.$emit("updated");
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchReservations();
        },
        openDialog(type, data) {
            if (type === "cancel") {
                this.cancelDialog.data = {
                    chargePointId: data.chargePointId,
                    connectorId: data.connectorId,
                    reservationId: data.id
                };
                this.cancelDialog.visible = true;
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog(type, isUpdate) {
            if (type === "cancel") {
                this.cancelDialog.visible = false;
                isUpdate && this.fetchReservations();
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
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
