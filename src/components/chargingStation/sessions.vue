<template>
    <div class="table-result">
        <el-table :data="tableData" v-loading="isLoading">
            <el-table-column prop="id" label="ID" width="70"></el-table-column>
            <el-table-column prop="idTagValue" :label="$t('menu.idTag')" width="220"></el-table-column>
            <el-table-column prop="authMethod" :label="$t('general.authMethod')" width="170"></el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" width="170"></el-table-column>
            <el-table-column prop="chargeStationName" :label="$t('chargingStation.stationName')" width="180"></el-table-column>
            <el-table-column prop="totalEnergy" :label="$t('general.totalEnergy') + ' (kWh)'" width="130">
                <template slot-scope="scope">
                    {{scope.row.cost.energyKwh ? scope.row.cost.energyKwh.toFixed(2):''}}
                </template>
            </el-table-column>
            <el-table-column prop="totalTimeSec" :label="$t('general.totalTime')" width="150">
                <template slot-scope="scope">
                    {{scope.row.cost.totalTimeSec? getConvertedTime(scope.row.cost.totalTimeSec):''}}
                </template>
            </el-table-column>
            <el-table-column prop="totalCost" :label="$t('general.totalCostWithVat')" width="130">
                <template slot-scope="scope">
                    {{scope.row.cost.total ?scope.row.cost.total.includingVat.toFixed(2):''}}
                </template>
            </el-table-column>
            <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" width="210">
                <template slot-scope="scope">
                    {{ scope.row.startTimestamp!==null ?getLocTime(scope.row.startTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" width="210">
                <template slot-scope="scope">
                    {{ scope.row.stopTimestamp!==null ? getLocTime(scope.row.stopTimestamp):'' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.sessionDetails')" width="130">
                <template slot-scope="scope">
                    <el-button type="primary" style="width:75%;margin-left:15px" @click="openDialog(scope.row)">{{$t('general.view')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
        <SessionsDetailsPopup v-if="dialog.visible" :show="dialog.visible" :data="dialog.data" @close="closeDialog()"></SessionsDetailsPopup>
    </div>
</template>

<script>
import {
    transformUtcToLocTime,
    transformSecondsToReadableForm
} from "@/utils/function";
import { $HTTP_getAllSessionsData } from "@/api/api";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import SessionsDetailsPopup from "@/components/popup/sessionsDetailsPopup.vue";
export default {
    props: {
        chargerId: String,
        dateRange: Array,
        isUpdateData: Boolean,
        ocppId: String
    },
    emits: ["updated"],
    components: {
        SessionsDetailsPopup
    },
    data() {
        return {
            isLoading: false,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            page: 1,
            tableData: [],
            expandedRowsCount: 0,
            dialog: {
                visible: false,
                data: [],
                isLoading: false
            }
        };
    },
    computed: {
        getLocTime() {
            return (item, format = "ll hh:mm:ss A") =>
                transformUtcToLocTime(item,format);
        },
        getConvertedTime() {
            return (item) => transformSecondsToReadableForm(item);
        }
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
    mounted() {
        this.getAllSessionsData();
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
        },
        openDialog(data) {
            this.dialog.visible = true;
            this.dialog.data = data;
        },
        closeDialog() {
            this.dialog.visible = false;
            this.dialog.data = [];
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
