<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)">
            <el-table-column prop="sessionId" :label="$t('chargingStation.sessionID')" :min-width="1"></el-table-column>
            <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="2"></el-table-column>
            <el-table-column prop="power" :label="$t('chargingStation.powerUsed')" :min-width="1">
                <template slot-scope="scope">
                    {{ scope.row.billingInfo.powerUsage + 'kWh' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="1">
                <template slot-scope="scope">
                    <Connector :key="idx" :dataObj="scope.row.connectorInfo"></Connector>
                </template>
            </el-table-column>
            <el-table-column prop="chargingStartTime" :label="$t('general.startTime')" :min-width="2"></el-table-column>
            <el-table-column prop="chargingEndTime" :label="$t('general.endTime')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('chargingStation.billing')" :width="120">
                <template slot-scope="scope">
                    <el-popover trigger="click" popper-class="dark" width="420" placement="left" :offset="-20" :visible-arrow="false">
                        <el-table :data="[scope.row.billingInfo]">
                            <el-table-column prop="billingCode" :label="$t('chargingStation.billingID')"></el-table-column>
                            <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
                            <el-table-column :label="$t('chargingStation.powerUsed')">
                                <template slot-scope="scope">
                                    {{ currencyList[scope.row.unitType] + scope.row.price }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="power" :label="$t('chargingStation.totalPrice')">
                                <template slot-scope="scope">
                                    {{ scope.row.powerUsage + 'kWh' }}
                                </template>
                            </el-table-column>
                        </el-table>
                        <div slot="reference" class="name-wrapper">{{scope.row.billingInfo.billingCode }}</div>
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
import { $GLOBAL_CURRENCY } from '@/utils/global';
import Connector from "@/components/chargingStation/connector";
export default {
    props: {
        tableData: {
            type: Array,
            required: true
        }
    },
    components: {
        Connector
    },
    data() {
        return {
            currencyList: $GLOBAL_CURRENCY,
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