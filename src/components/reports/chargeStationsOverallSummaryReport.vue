<template>
    <div class="table-result">
        <el-button size="small" type="primary" @click="fetchData">{{ $t(`general.generate`) }}</el-button>
        <el-table :data="tableData" v-loading="isLoading">
            <el-table-column prop="dcFastChargers" :label="$t('chargingStation.dcFastChargers')" :min-width="1"></el-table-column>
            <el-table-column prop="weeklyUtilization" :label="$t('chargingStation.weeklyUtilization')" :min-width="1"></el-table-column>
            <el-table-column :label="$t('chargingStation.averageSessionPower') + '(kW)'" :min-width="1">
                <template slot-scope="scope">
                    {{ scope.row.averageSessionPower.toFixed(2) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.averageHoursPerSession')" :min-width="1">
                <template slot-scope="scope">
                    {{ scope.row.averageHoursPerSession.toFixed(2) }}
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>
<script>
import { $HTTP_getChargeStationsOverallSummary } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";

export default {
    props: {
        filterParams: Object,
        dropdownSelected: String,
        downloadClicked: Boolean
    },
    emits: ["emitFetchedData"],
    data() {
        return {
            tableData: [],
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            isLoading: false
        };
    },
    watch: {
        downloadClicked: function () {
            if (this.downloadClicked) {
                this.fetchData();
            }
        }
    },
    mounted() {
        // this.fetchData();
    },
    methods: {
        fetchData() {
            let params = {
                page: this.page,
                limit: this.limit
            };
            if (this.filterParams) {
                params = { ...params, ...this.filterParams };
            }
            this.isLoading = true;
            $HTTP_getChargeStationsOverallSummary(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res) {
                        this.tableData = [res];
                        this.total = 1;
                        this.$emit("emitFetchedData", {
                            total: 1,
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
    margin-bottom: 5px;
}
</style>
