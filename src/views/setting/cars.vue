<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.setting') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.cars') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        :placeholder="$t('setting.marker')"
                        v-loading="carBandList.isLoading"
                        v-model="filter.carBrand"
                        @change="handleCarBandChange()"
                        filterable
                        clearable>
                        <el-option v-for="(item, key) in carBandList.data" :label="key" :key="key" :value="key"></el-option>
                    </el-select>
                    <el-select
                        class="select-small"
                        v-model="filter.carModel"
                        :placeholder="$t('setting.model')"
                        v-loading="carBandList.isLoading"
                        @change="fetchData()"
                        filterable
                        clearable>
                        <el-option v-for="(item, idx) in carBandList.modelList" :label="item.carModel" :key="idx" :value="item.carModel"></el-option>
                    </el-select>
                    <el-input
                        placeholder="ID"
                        v-model="filter.tmpSearch"
                        @fetchData="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="carId" label="ID" :min-width="2"></el-table-column>
                    <el-table-column prop="carBrand" :label="$t('setting.marker')" :min-width="2"></el-table-column>
                    <el-table-column prop="carModel" :label="$t('setting.model')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.carPower + "hp"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('setting.batteryCapacity')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.batteryCapacity + "kWh"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('setting.realRange')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.realRange + "km"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('setting.acPower')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.acPower ? scope.row.acPower + "kW" : ''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="acPlug" :label="$t('setting.acPlug')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('setting.dcPower')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.dcPower ? scope.row.dcPower + "kW" : ''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="dcPlug" :label="$t('setting.dcPlug')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.action')" :width="72">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail"></el-button>
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
        </div>
    </div>
</template>

<script>
import { $HTTP_getCarBrandListForSelect, $HTTP_getCarList } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            lang: '',
            filter: {
                carBrand: '',
                carModel: '',
                tmpSearch: '',
                search: ''
            },
            carBandList: {
                isLoading: false,
                data: {},
                modelList: []
            },
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
        this.fetchCarBandList();
        this.fetchData();
    },
    methods: {
        fetchCarBandList() {
            const that = this;
            this.carBandList.isLoading = true;
            $HTTP_getCarBrandListForSelect().then((data) => {
                that.carBandList.isLoading = false;
                if (!!data.success) {
                    that.carBandList.data = {};
                    that.carBandList.modelList = [];
                    data.carBrandList.forEach(item => {
                        that.carBandList.data[item.carBrand] = item.carModelList.slice();
                        that.carBandList.modelList = that.carBandList.modelList.concat(item.carModelList);
                    });
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('carBandList', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {};
            if (this.filter.carBrand) {
                param.carBrand = this.filter.carBrand;
            }
            if (this.filter.carModel) {
                param.carModel = this.filter.carModel;
            }
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getCarList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.carList.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
        },
        handleCarBandChange() {
            this.filter.carModel = "";
            this.carBandList.modelList = [];
            if (this.filter.carBrand !== '') {
                this.carBandList.modelList = this.carBandList.data[this.filter.carBrand].slice();
            } else {
                for(var key in this.carBandList.data) {
                    this.carBandList.modelList = this.carBandList.modelList.concat(this.carBandList.data[key].slice());
                }
            }
            this.fetchData();
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
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