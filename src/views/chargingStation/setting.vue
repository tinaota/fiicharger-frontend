<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.setting') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol">
                    <el-table-column prop="rateId" :label="$t('chargingStation.rateID')"></el-table-column>
                    <el-table-column prop="rateName" :label="$t('chargingStation.rateName')"></el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column v-for="(item, key) in $t('chargingStation.elecRateList')" :key="key" :label="item">
                            <template slot-scope="scope">{{ scope.row.electricityRate[item] +"/kWh" }}</template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')">
                        <template slot-scope="scope">
                            <el-button @click="openDialog(1, scope.row)">{{ $t('general.modify') }}</el-button>
                            <el-button @click="deleteSetting(scope.row.rateId)">{{ $t('general.delete') }}</el-button>
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
                <el-dialog
                :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
                width="600px"
                :visible.sync="dialog.visible"
                :show-close="false">
                <div class="vertial formVertical">
                    <div class="form-item" v-if="dialog.type">
                        <div class="label">{{ $t('chargingStation.rateID') }}</div>
                        <el-input v-model="dialog.info.rateId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.rateName') }}</div>
                        <el-input v-model="dialog.info.rateName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                    </div>
                    <div class="form-item" v-for="(item, key) in $t('chargingStation.elecRateList')" :key="key">
                        <div class="label">{{ "● "+item }}</div>
                        <el-input v-model="dialog.info.electricityRate[key]"></el-input>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateSetting">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            </div>
        </div>
    </div>
</template>

<script>
import SettingData from "@/tmpData/settingData";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            tableData: [],
            page: 1,
            total: 0,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    rateId: '',
                    rateName: '',
                    electricityRate: {
                        "AC On-Pick": '$0',
                        "AC Off-Pick": '$0',
                        "DC On-Pick": '$0',
                        "DC Off-Pick": '$0'
                    }
                }
            }
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = SettingData.settingList.slice();
            this.page = 1;
            this.total = this.tableData.length;
            setScrollBar('.scroll', this);
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            this.$jQuery(".vertial.formVertical").length > 0 && this.$jQuery(".vertial.formVertical").mCustomScrollbar('destroy');
            if (type) {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
            that.$nextTick(() => {
                setScrollBar('.vertial.formVertical', that);
            });
        },
        deleteSetting(id) {
            this.tableData = this.tableData.filter(item => item.stationId !== id);
            this.total = this.tableData.length;
        },
        updateSetting() {
            if (!this.dialog.type) {
                let data = Object.assign({}, this.dialog.info);
                data.rateId = "E00" + (this.tableData.length + 1);
                this.tableData.push(data);
            } else {
                let tmp = [];
                this.tableData.forEach(item => {
                    if(item.id === this.dialog.info.id) {
                        item = Object.assign(item, this.dialog.info);
                    }
                    tmp.push(item);
                });
                this.tableData = tmp;
            }
            this.dialog.visible = false;
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .filter {
        margin-bottom: 0;
    }
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