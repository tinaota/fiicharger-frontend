<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)"
            v-loading="isLoading">
            <el-table-column prop="alertCode" :label="$t('chargingStation.alertID')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="2">
                <template slot-scope="scope">
                    <Connector v-if="scope.row.connectorIsExistedFlag" :dataObj="scope.row.connectorInfo"></Connector>
                    <span v-else>{{ $t('chargingStation.failure') }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="alertTitle" :label="$t('chargingStation.alert')" :min-width="3"></el-table-column>
            <el-table-column prop="sDate" :label="$t('chargingStation.alertTime')" :min-width="3"></el-table-column>
            <el-table-column prop="eDate" :label="$t('general.closedTime')" :min-width="3"></el-table-column>
            <el-table-column prop="workOrderCode" :label="$t('chargingStation.workeOrder')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('chargingStation.workeOrderStatus')" :min-width="2">
                <template slot-scope="scope">
                    {{ $t('support.workOrderStatus')[scope.row.workOrderStatus] }}
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total})}}</div>
        <el-pagination background layout="prev, pager, next"
            :total="total"
            :pager-count="5"
            :page-size="10"
            :current-page.sync="page"
            @current-change="changePage">
        </el-pagination>
    </div>
</template>

<script>
import { $HTTP_getChargeHistoryAlertList } from "@/api/api";
import Connector from "@/components/chargingStation/connector";
export default {
    props: {
        chargeBoxId: String
    },
    components: {
        Connector
    },
    data() {
        return {
            lang: '',
            tableData: [],
            isLoading: false,
            page: 1,
            total: 0,
        }
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {
                chargeBoxId: this.chargeBoxId
            };
            $HTTP_getChargeHistoryAlertList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargeAlertList.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log('alert', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        }
    }
}
</script>
<style lang = "scss" scoped>
.tab {
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>