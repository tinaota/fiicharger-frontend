<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)">
            <el-table-column prop="valuationCode" :label="$t('userAccount.reviewId')" :min-width="4"></el-table-column>
            <!-- <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="5"></el-table-column>
            <el-table-column :label="$t('chargingStation.power')" :min-width="3">
                <template slot-scope="scope">
                    {{scope.row.power + "kW"}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="4">
                <template slot-scope="scope">
                    <Connector v-for="(item, idx) in scope.row.connectorList" :key="idx" :dataObj="item" :isBreak="true"></Connector>
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.type')" :min-width="2">
                <template slot-scope="scope">
                    {{ scope.row.chargeType === 1 ? "AC" : "DC" }}
                </template>
            </el-table-column> -->
            <el-table-column prop="content" :label="$t('userAccount.comment')" :min-width="5" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column :label="$t('userAccount.review')" :min-width="4" >
                <!-- :width="148"> -->
                <template slot-scope="scope">
                    <el-rate
                        v-model="scope.row.point"
                        score-template="{value}"
                        disabled
                        show-score>
                    </el-rate>
                </template>
            </el-table-column>
            <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="4"></el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item: total})}}</div>
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
import { $HTTP_getValuationList } from "@/api/api";
import Connector from "@/components/chargingStation/connector";
import { transformUtcToLocTime } from "@/utils/function";
export default {
    props: {
        memberCode: String
    },
    components: {
        Connector
    },
    data() {
        return {
            lang: '',
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0
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
            let param = {
                memberCode: this.memberCode
            };
            $HTTP_getValuationList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.valuationList.map(item => {
                        item.fDate = transformUtcToLocTime(item.fDate);
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
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
        bottom: 2px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>