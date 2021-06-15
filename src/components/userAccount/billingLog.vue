<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)">
            <el-table-column prop="billingId" :label="$t('chargingStation.billingID')" :min-width="1"></el-table-column>
            <el-table-column prop="billingTime" :label="$t('general.time')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('chargingStation.totalPrice')" :min-width="1">
                <template slot-scope="scope">
                    {{ "$" + scope.row.price }}
                </template>
            </el-table-column>
            <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column>
            <el-table-column prop="billingType" :label="$t('chargingStation.billingType')" :min-width="2"></el-table-column>
            <el-table-column prop="billingStatus" :label="$t('chargingStation.billingStatus')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('chargingStation.sessionID')" :width="120">
                <template slot-scope="scope">
                    <el-popover trigger="click" popper-class="dark" width="680" placement="left" :offset="-20" :visible-arrow="false">
                        <el-table :data="[scope.row.sessionInfo]">
                            <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')"></el-table-column>
                            <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')"></el-table-column>
                            <el-table-column prop="power" :label="$t('chargingStation.powerUsed')">
                                <template slot-scope="scope">
                                    {{ scope.row.power + 'kWh' }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('chargingStation.connector')">
                                <template slot-scope="scope">
                                    <div v-for="(item, key) in scope.row.connector" :key="key">{{ "("+ key +") "+ item }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="sTime" :label="$t('general.startTime')"></el-table-column>
                            <el-table-column prop="eTime" :label="$t('general.endTime')"></el-table-column>
                            <el-table-column :label="$t('chargingStation.totalPrice')">
                                <template slot-scope="scope">
                                    {{ "$" + scope.row.price }}
                                </template>
                            </el-table-column>
                        </el-table>
                        <div slot="reference" class="name-wrapper">{{scope.row.sessionId }}</div>
                    </el-popover>
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