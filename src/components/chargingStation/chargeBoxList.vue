<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 5, page * 5)"
            v-loading="isLoading">
            <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="1"></el-table-column>
            <el-table-column prop="chargeBoxName" :label="$t('general.name')" :min-width="1"></el-table-column>
            <el-table-column :label="$t('general.status')" :min-width="1">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.chargeBoxStatus===1" :content="$t('chargingStation.connection')" placement="top" effect="light" popper-class="item custom">
                        <span class="circle-status color1"></span>
                    </el-tooltip>
                    <el-tooltip v-else :content="$t('chargingStation.disconnection')" placement="top" effect="light" popper-class="item custom">
                        <span class="circle-status color5"></span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.power')" :min-width="1">
                <template slot-scope="scope">
                    {{scope.row.power + "kWh"}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="1">
                <template slot-scope="scope">
                    <div v-for="(item, key) in scope.row.connectorTypeInfo" :key="key">{{ "("+ key +") "+ item }}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.type')" :min-width="1">
                <template slot-scope="scope">
                    {{ scope.row.chargeType === 1 ? "AC" : "DC" }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.elecRate')">
                <el-table-column :label="$t('chargingStation.onPeak')" :min-width="1">
                    <template slot-scope="scope">
                        {{ scope.row.currency + scope.row.onPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.onPeakElectricityRateType]}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('chargingStation.offPeak')" :min-width="1">
                    <template slot-scope="scope">
                        {{ scope.row.currency + scope.row.offPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.offPeakElectricityRateType]}}
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="$t('general.action')" :width="108">
                <template slot-scope="scope">
                    <!-- <el-button @click="openDialog(1, scope.row)">{{ $t('general.modify') }}</el-button> -->
                    <el-button class="unbind" @click="unBindCheckBox(scope.row.chargeBoxId, scope.row.chargeBoxName)">{{ $t('general.unbind') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total})}}</div>
        <el-pagination background layout="prev, pager, next"
            :total="total"
            :pager-count="5"
            :page-size="5"
            :current-page.sync="page"
            @current-change="changePage">
        </el-pagination>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getChargeBoxList } from "@/api/api";
export default {
    props: {
        stationId: String
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
    methods: {
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            // this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {
                stationId: this.stationId,
                status: 0
            };
            $HTTP_getChargeBoxList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargeBoxList.map(item => {
                        item.currency = $GLOBAL_CURRENCY[item.unitType];
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                // setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        unBindCheckBox(id, name) {
            // const that = this;
            // this.$confirm(i18n.t('general.deleteItem', { item: name }), i18n.t('general.hint'), {
            //     showClose: false,
            //     customClass: 'dark'
            // }).then(() => {
                //要換成解榜的
            //     $HTTP_deleteChargeBox({stationId: this.stationId, chargeBoxId: id}).then(data => {
            //         if (!!data.success) {
            //             that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
            //             that.fetchData();
            //         } else {
            //             that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
            //         }
            //     });
            // });
        },
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