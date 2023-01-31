<template>
    <div class="table-result">
        <el-button size="small" type="primary" @click="fetchData">{{ $t(`general.generate`) }}</el-button>
        <el-table :data="tableData" v-loading="isLoading" @sort-change="updateSorting">
            <el-table-column prop="ocppId" :label="$t('chargingStation.chargerId')" width="320" sortable="custom">
            </el-table-column>
            <el-table-column prop="name" :label="$t('general.name')" width="320" sortable="custom"></el-table-column>
            <el-table-column prop="powerKw" :label="$t('chargingStation.power') + ' (kW)'" width="150" sortable="custom">
            </el-table-column>
            <el-table-column prop="currentType" :label="$t('general.type')" width="200" class-name="center" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.currentType }}
                </template>
            </el-table-column>
            <el-table-column prop="lastHeartbeat" :label="$t('chargingStation.lastHeartbeat')" width="250" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="created" :label="$t('userAccount.createdDate')" width="250" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.created!==null? getLocTime(scope.row.created):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="modified" :label="$t('general.latestModification')" width="250" sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.modified!==null? getLocTime(scope.row.modified):'' }}
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>
<script>
import { $HTTP_getAllChargeBoxList } from "@/api/api";
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
        },
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
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
        },
        selectedOrganization: function () {
            this.fetchData();
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
            if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            $HTTP_getAllChargeBoxList(params)
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
    margin-bottom: 5px;
}
</style>
