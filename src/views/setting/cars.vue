<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.cars') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        :placeholder="$t('cars.marker')"
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
                        :placeholder="$t('cars.model')"
                        v-loading="carBandList.isLoading"
                        @change="fetchData()"
                        filterable
                        clearable>
                        <el-option v-for="(item, idx) in carBandList.modelList" :label="item.carModel" :key="idx" :value="item.carModel"></el-option>
                    </el-select>
                    <el-input
                        placeholder="ID"
                        v-model="filter.tmpSearch"
                        @change="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <!-- <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus"></el-button> -->
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="carId" label="ID" :min-width="2"></el-table-column>
                    <el-table-column prop="carBrand" :label="$t('cars.marker')" :min-width="3"></el-table-column>
                    <el-table-column prop="carModel" :label="$t('cars.model')" :min-width="4"></el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.carPower + "hp"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('cars.batteryCapacity')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.batteryCapacity + "kWh"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('cars.realRange')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.realRange + "km"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('cars.acPower')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.acPower ? scope.row.acPower + "kW" : ''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="acPlug" :label="$t('cars.acPlug')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('cars.dcPower')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.dcPower ? scope.row.dcPower + "kW" : ''}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="dcPlug" :label="$t('cars.dcPlug')" :min-width="3"></el-table-column>
                    <!-- <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="140">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail" @click="openDialog(scope.row.carId)"></el-button>
                            <el-button class="no-bg edit"></el-button>
                            <el-button class="no-bg delete"></el-button>
                        </template>
                    </el-table-column>
                    <el-table-column v-else :label="$t('general.action')" :width="65">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail" @click="openDialog(scope.row.carId)"></el-button>
                        </template>
                    </el-table-column> -->
                    <el-table-column :label="$t('general.action')" :width="65">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail" @click="openDialog(scope.row.carId)"></el-button>
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
                    :title="$t('general.detail')"
                    width="50%"
                    :visible.sync="dialog.visible"
                    :show-close="false"
                    v-loading="dialog.isLoading"
                    @close="closeDialog()">
                    <div class="tabs-contain carDetail">
                        <el-tabs v-model="dialog.active" @tab-click="handleTabClick">
                            <el-tab-pane :label="$t('cars.carType')" name="carType">
                                <div class="carType">
                                    <div class="item">
                                        <div class="label">{{ $t('cars.marker') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.carBrand || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.model') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.carModel || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.version') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.carModelVersion || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ '0-100 km/h '}}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.performanceAcceleration || '-' + ' sec(s)' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.topSpeed') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.performanceTopSpeed || '-' + ' km/h' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.propulsion') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.performanceTopSpeed || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.turningCircle') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.turningCircle || '-' + ' m' }}</div>
                                    </div>
                                </div>
                            </el-tab-pane>
                            <el-tab-pane :label="$t('cars.battery')" name="battery">
                                <div class="battery">
                                    <div class="item">
                                        <div class="label">{{ $t('cars.batteryCapacity') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.batteryCapacity || '-' + ' kWh' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.capacityUseable') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.batteryCapacityUseable || '-' + ' kWh' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.acPlug') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.acPlug || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.acPower') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.acPower || '-' + ' kW' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.aCPhases') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.acPhase || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.dcPlug') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.dcPlug || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.dcPower') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.dcPower || '-' + ' kW' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.chargePlugLocation') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.chargePlugLocation || '-' }}</div>
                                    </div>
                                </div>
                            </el-tab-pane>
                            <el-tab-pane :label="$t('cars.miscellaneous')" name="miscellaneous">
                                <div class="miscellaneous">
                                    <div class="item">
                                        <div class="label">{{ $t('cars.seats') }}</div>
                                        <div class="info">{{ dialog.info.carMiscellaneousInfo.miscSeats || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.carBody') }}</div>
                                        <div class="info">{{ dialog.info.carMiscellaneousInfo.miscBody || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.isofix') }}</div>
                                        <div class="info">{{ dialog.info.carMiscellaneousInfo.miscIsofix || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.isofixSeats') }}</div>
                                        <div class="info">{{ dialog.info.carMiscellaneousInfo.miscIsofixSeats || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.segment') }}</div>
                                        <div class="info">{{ dialog.info.carMiscellaneousInfo.miscSegment || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.picture') }}</div>
                                        <div class="info"><img :src="dialog.info.carMiscellaneousInfo.carPicPath" width="360" height="200"></div>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>

<script>
import { $HTTP_getCarBrandListForSelect, $HTTP_getCarList, $HTTP_getCarInfo } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            lang: '',
            permissionEditAble: false,
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
            total: 0,
            dialog: {
                visible: false,
                isLoading: false,
                active: 'carType',
                carId: '',
                info: {
                    carTypeInfo: {
                        carBrand: '',
                        carModel: '',
                        carModelVersion: '',
                        performanceAcceleration: '',
                        performanceTopSpeed: '',
                        performanceTopSpeed: '',
                        turningCircle: '',
                    },
                    carBatteryInfo: {
                        batteryCapacity: '',
                        batteryCapacityUseable: '',
                        acPlug: '',
                        acPower: '',
                        acPhase: '',
                        dcPlug: '',
                        dcPower: '',
                        chargePlugLocation: ''
                    },
                    carMiscellaneousInfo: {
                        miscSeats: '',
                        miscBody: '',
                        miscIsofix: '',
                        miscIsofixSeats: '',
                        miscSegment: '',
                        carPicPath: ''
                    }
                }
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user')),
              accPermissionType = userData.accountInfo.accPermissionType;
        if (accPermissionType === 1) {
            this.permissionEditAble = true;
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        setScrollBar('.scroll', this);
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
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchCarInfo() {
            const that = this;
            let param = {
                carId: this.dialog.carId
            };
            this.dialog.isLoading = true;
            $HTTP_getCarInfo(param).then((data) => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.dialog.info.carTypeInfo = Object.assign({}, data.carTypeInfo);
                    that.dialog.info.carBatteryInfo = Object.assign({}, data.carBatteryInfo);
                    that.dialog.info.carMiscellaneousInfo = Object.assign({}, data.carMiscellaneousInfo);
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('chargeBoxList', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
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
        },
        openDialog(carId) {
            const that = this;
            this.dialog.carId = carId;
            this.dialog.info = {
                                carTypeInfo: {
                                    carBrand: '',
                                    carModel: '',
                                    carModelVersion: '',
                                    performanceAcceleration: '',
                                    performanceTopSpeed: '',
                                    performanceTopSpeed: '',
                                    turningCircle: '',
                                },
                                carBatteryInfo: {
                                    batteryCapacity: '',
                                    batteryCapacityUseable: '',
                                    acPlug: '',
                                    acPower: '',
                                    acPhase: '',
                                    dcPlug: '',
                                    dcPower: '',
                                    chargePlugLocation: ''
                                },
                                carMiscellaneousInfo: {
                                    miscSeats: '',
                                    miscBody: '',
                                    miscIsofix: '',
                                    miscIsofixSeats: '',
                                    miscSegment: '',
                                    carPicPath: ''
                                }
                            };
            this.active = 'carType';
            this.fetchCarInfo();
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleTabClick(tab, event) {
        },
        closeDialog() {
            this.$jQuery(".scroll").mCustomScrollbar("update");
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
    .carDetail {
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 200px;
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
                vertical-align: top;
            }
            .info {
                display: inline-block;
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151E25;
                letter-spacing: 0;
            }
        }
    }
}
</style>