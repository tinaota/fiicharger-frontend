<template>
    <div class="table-result">
        <el-button size="small" type="primary" @click="fetchData">{{ $t(`general.generate`) }}</el-button>
        <el-table :data="tableData" v-loading="isLoading" @sort-change="updateSorting">
            <el-table-column prop="id" :label="$t('chargingStation.reservationId')" width="140" sortable="custom"></el-table-column>
            <el-table-column prop="chargePointName" :label="$t('chargingStation.chargePointName')" width="200" sortable="custom"></el-table-column>
            <el-table-column prop="connectorId" :label="$t('chargingStation.connectorId')" width="130" sortable="custom"></el-table-column>
            <el-table-column prop="idTag" :label="$t('menu.idTag')" width="180" sortable="custom"></el-table-column>
            <el-table-column prop="transactionId" :label="$t('chargingStation.transactionId')" width="180" sortable="custom"></el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" width="120" sortable="custom"></el-table-column>
            <el-table-column :label="$t('chargingStation.startDateTime')" width="210" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.created ? getLocTime(scope.row.created) : '' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.expiryDateTime')" width="210" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.expiryDate ? getLocTime(scope.row.expiryDate) : '' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.cancelledDateTime')" width="210" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.cancelled ? getLocTime(scope.row.cancelled) : '' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.usedDateTime')" width="210" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.used ? getLocTime(scope.row.used) : '' }}
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>
<script>
import { $HTTP_getReservation } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { transformUtcToLocTime, catchErrors } from "@/utils/function";

export default {
    props: {
        filterParams: Object,
        dropdownSelected: String,
        downloadClicked: Boolean,
        sortingParams: Object
    },
    emits: ["emitFetchedData", "tableSorting"],
    data() {
        return {
            tableData: [],
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            isLoading: false
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    watch: {
        downloadClicked: function () {
            if (this.downloadClicked) {
                this.fetchData();
            }
        },
        sortingParams() {
            // check if sorting object is present
            if (Object.keys(this.sortingParams).length > 0) {
                this.fetchData();
            }
        }
    },
    mounted() {},
    beforeDestroy() {
        this.$emit("tableSorting", {});
    },
    methods: {
        updateSorting(data) {
            let tableSorting = {
                OrderBy: data.prop,
                IsDescending: data.order === "descending" || data.order === null
            };
            this.$emit("tableSorting", tableSorting);
        },
        fetchData() {
            let params = {
                page: this.page,
                limit: this.limit
            };
            if (this.filterParams) {
                params = { ...params, ...this.filterParams };
            }
            if (this.sortingParams) {
                params = { ...params, ...this.sortingParams };
            }
            this.isLoading = true;
            $HTTP_getReservation(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                        this.$emit("emitFetchedData", {
                            total: res.metadata.totalRows,
                            complete: true
                        });
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.tableData = [];
                    this.total = 0;
                    let errorMessage = catchErrors("reservation report", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        }
    }
};
</script>
<style lang="scss" scoped>
.total {
    position: absolute;
    right: 28px;
    bottom: 28px;
    height: 36px;
    line-height: 36px;
    vertical-align: middle;
    font-size: 1rem;
    color: #5a607f;
    letter-spacing: 0;
}

.el-button {
    background: #0263ff !important;
    color: #fff;
    border: unset;
    font-size: 1rem;
    width: 130px !important;
    height: 40px;
    border-radius: 6px;
    text-align: center;
    margin-left: 5px;
    margin-bottom: 5px;
}
</style>
