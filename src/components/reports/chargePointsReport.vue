<template>
    <div class="table-result">
        <el-table :data="tableData" v-loading="isLoading">
            <el-table-column prop="id" :label="$t('chargingStation.chargerId')" :min-width="3">
            </el-table-column>
            <el-table-column prop="name" :label="$t('general.name')" :min-width="3"></el-table-column>
            <el-table-column :label="$t('chargingStation.power')" :min-width="1">
                <template slot-scope="scope">
                    {{ scope.row.powerKw + "kW" }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.type')" :min-width="2" class-name="center">
                <template slot-scope="scope">
                    {{ scope.row.currentType }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.lastHeartbeat')" :min-width="2">
                <template slot-scope="scope">
                    {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="diagnosticsStatus" :label="$t('general.diagnosticsStatus')" :min-width="3"></el-table-column>
            <el-table-column prop="firmwareStatus" :label="$t('general.firmwareStatus')" :min-width="3"></el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
        <div v-if="tableData.length>0" class="downloads" style="display:flex">
            <DownloadCSV :filterParams="filterParams" :dropdownSelected="dropdownSelected" :total="total"></DownloadCSV>
            <DownloadPDF></DownloadPDF>
        </div>
    </div>
</template>
<script>
import { $HTTP_getAllChargeBoxList } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { transformUtcToLocTime } from "@/utils/function";
import DownloadCSV from "@/components/reports/downloads/DownloadCSV.vue";
import DownloadPDF from "@/components/reports/downloads/DownloadPDF.vue";

export default {
    components: { DownloadCSV, DownloadPDF },
    props: {
        filterParams: Object,
        dropdownSelected: String
    },
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
        filterParams: function () {
            this.fetchData();
        }
    },
    mounted() {
        this.fetchData();
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
            $HTTP_getAllChargeBoxList(params)
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
</style>
