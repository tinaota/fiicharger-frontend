<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)">
            <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="2"></el-table-column>
            <el-table-column prop="chargeBoxName" :label="$t('chargingStation.chargeBoxName')" :min-width="1"></el-table-column>
            <el-table-column prop="status" :label="$t('chargingStation.serviceStatus')" :min-width="1">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.status==1" class="item" effect="dark" :content="$t('general.active')" placement="right">
                        <span class="circle-status green"></span>
                    </el-tooltip>
                    <el-tooltip v-else-if="!scope.row.status" class="item" effect="dark" :content="$t('general.unactive')" placement="right">
                        <span class="circle-status gray"></span>
                    </el-tooltip>
                    <el-tooltip v-else class="item" effect="dark" :content="$t('general.repair')" placement="right">
                        <span class="circle-status orange"></span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.power')" :min-width="1">
                <template slot-scope="scope">
                    {{scope.row.power + "kWh"}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="2">
                <template slot-scope="scope">
                    <div v-for="(item, key) in scope.row.connector" :key="key">{{ "("+ key +") "+ item }}</div>
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
export default {
    props: {
        tableData: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            page: 1,
            total: 0,
        }
    },
    watch: {
        tableData: {
            deep: true,
            handler() {
                this.total = this.tableData.length;
                this.page = 1;
            }
        }
    },
    methods : {
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
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>