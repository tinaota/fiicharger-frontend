<template>
    <div class="table-result">
        <el-table :data="tableData" v-loading="isLoading">
            <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
            <el-table-column prop="idTagValue" :label="$t('menu.idTag')" :min-width="2"></el-table-column>
            <el-table-column prop="authMethod" :label="$t('general.authMethod')" :min-width="2"></el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" :min-width="2"></el-table-column>
            <el-table-column prop="chargeStationName" :label="$t('chargingStation.stationName')" :min-width="2"></el-table-column>
            <el-table-column prop="reservationId" :label="$t('chargingStation.reservationId')" :min-width="2"></el-table-column>
            <el-table-column prop="transactionId" :label="$t('chargingStation.transactionId')" :min-width="2"></el-table-column>
            <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" :min-width="2">
                <template slot-scope="scope">
                    {{ getLocTime(scope.row.startTimestamp) }}
                </template>
            </el-table-column>
            <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" :min-width="2">
                <template slot-scope="scope">
                    {{ getLocTime(scope.row.stopTimestamp) }}
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
import { $HTTP_getAllSessionsData } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";

export default {
    data() {
        return {
            isLoading: false,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            page: 1,
            tableData: []
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
    },
    watch: {
        dateRange: function () {
            this.getAllSessionsData();
        }
    },
    methods: {
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
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                })
                .catch((err) => {
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
