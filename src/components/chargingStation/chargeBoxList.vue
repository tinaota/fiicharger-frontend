<template>
    <div class="tab">
        <el-table
            :data="tableData.slice((page - 1) * 5, page * 5)"
            v-loading="isLoading">
            <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="2"></el-table-column>
            <el-table-column prop="chargeBoxName" :label="$t('general.name')" :min-width="1"></el-table-column>
            <el-table-column :label="$t('general.status')" :min-width="1">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.chargeBoxStatus===1" :content="$t('chargingStation.connection')" placement="bottom" effect="light" popper-class="custom">
                        <span class="circle-status color1"></span>
                    </el-tooltip>
                    <el-tooltip v-else :content="$t('chargingStation.disconnection')" placement="bottom" effect="light" popper-class="custom">
                        <span class="circle-status color5"></span>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.power')" :min-width="1">
                <template slot-scope="scope">
                    {{scope.row.power + "kW"}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingStation.connector')" :min-width="1">
                <template slot-scope="scope">
                    <Connector v-for="(item, idx) in scope.row.connectorList" :key="idx" :dataObj="item" :isBreak="true"></Connector>
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
                    <el-button class="no-bg edit" @click="openDialog(scope.row)"></el-button>
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
        <EditChargeBox name="stationDetail" :show="dialogVisible" :dialog="dialog" @close="()=> {this.dialogVisible = false;}"></EditChargeBox>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getChargeBoxList } from "@/api/api";
import EditChargeBox from "@/components/chargingStation/editChargeBox"
import Connector from "@/components/chargingStation/connector";
export default {
    props: {
        stationId: String
    },
    components: {
        EditChargeBox,
        Connector
    },
    data() {
        return {
            lang: '',
            tableData: [],
            isLoading: false,
            page: 1,
            total: 0,
            dialogVisible: false,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    chargeBoxId: '',
                    chargeBoxName: '',
                    loc: {
                        lng: '',
                        lon: '',
                        lat: ''
                    },
                    stationId: '',
                    chargeType: 1,
                    unitType: '',
                    onPeakElectricityRate: 0,
                    onPeakElectricityRateType: 1,
                    offPeakElectricityRate: 0,
                    offPeakElectricityRateType: 1
                }
            },
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
            let param = {
                stationId: this.stationId
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
        openDialog(data) {
            const that = this;
            this.dialog.type = 1;
            this.dialog.info = Object.assign({}, data);
            this.dialog.info.loc.lng = this.dialog.info.loc.lon;
            this.dialogVisible = true;
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