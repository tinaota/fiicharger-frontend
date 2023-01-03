<template>
    <div class="table-result">
        <el-button size="small" type="primary" @click="fetchData">{{ $t(`general.generate`) }}</el-button>
        <el-table :data="tableData" v-loading="isLoading" @sort-change="updateSorting">
            <el-table-column prop="id" :label="$t('chargingStation.transactionId')" width="100" sortable="custom">
            </el-table-column>
            <el-table-column prop="chargePointName" :label="$t('chargingStation.chargePointName')" width="200" sortable="custom"></el-table-column>
            <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" width="100" sortable="custom">
            </el-table-column>
            <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" width="200" sortable="custom"></el-table-column>
            <el-table-column prop="stopIdTag" :label="$t('chargingStation.stopIdTag')" width="200" sortable="custom"></el-table-column>
            <el-table-column prop="meterStart" :label="$t('chargingStation.meterStart')+' (kWh)'" width="100" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.meterStart!==null? scope.row.meterStart.toFixed(2) :'' }}
                </template>
            </el-table-column>
            <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" width="180" sortable="custom">
                <template slot-scope="scope">
                    {{ getLocTime(scope.row.startTimestamp) }}
                </template>
            </el-table-column>
            <el-table-column prop="meterStop" :label="$t('chargingStation.meterStop')+' (kWh)'" width="100" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.meterStop!==null? scope.row.meterStop.toFixed(2):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" width="180" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.stopTimestamp!==null? getLocTime(scope.row.stopTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopReason" :label="$t('chargingStation.stopReason')" width="130" sortable="custom"></el-table-column>
            <el-table-column prop="meterTotal" :label="$t('chargingStation.meterTotal')+' (kWh)'" width="100" sortable="custom">
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
import { $HTTP_getAllTransactions } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { transformUtcToLocTime } from "@/utils/function";

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
                limit: this.limit,
                OrderBy: "id",
                IsDescending: false
            };
            if (this.filterParams) {
                params = { ...params, ...this.filterParams };
            }
            if (this.sortingParams) {
                params = { ...params, ...this.sortingParams };
            }
            this.isLoading = true;
            $HTTP_getAllTransactions(params)
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
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
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
    margin-bottom: 20px;
}
</style>
