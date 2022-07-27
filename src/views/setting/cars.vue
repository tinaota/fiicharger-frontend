<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.cars') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select class="select-small" :placeholder="$t('cars.maker')" v-loading="carBandList.isLoading" v-model="filter.carBrand" @change="handleCarBandChange()" filterable clearable>
                        <el-option v-for="(item, key) in carBandList.data" :label="item" :key="key" :value="item"></el-option>
                    </el-select>
                    <el-select class="select-small" v-model="filter.carModel" :placeholder="$t('cars.model')" v-loading="carModelList.isLoading" @change="fetchData('models')" filterable clearable>
                        <el-option v-for="(item, idx) in carModelList.data" :label="item" :key="idx" :value="item"></el-option>
                    </el-select>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openCreateDialog()"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                    <el-table-column prop="make" :label="$t('cars.maker')" :min-width="3"></el-table-column>
                    <el-table-column prop="model" :label="$t('cars.model')" :min-width="4"></el-table-column>
                    <el-table-column prop="trim" :label="$t('cars.trim')" :min-width="4"></el-table-column>
                    <el-table-column prop="year" :label="$t('cars.year')" :min-width="4"></el-table-column>
                    <el-table-column :label="$t('cars.acPower')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.chargePower ? scope.row.chargePower + "kW" : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="plugType" :label="$t('cars.acPlug')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('cars.dcPower')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.fastChargePower ? scope.row.fastChargePower + "kW" : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="fastChargePlugType" :label="$t('cars.dcPlug')" :min-width="3"></el-table-column>
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="140">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail" @click="openDetailDialog(scope.row.id)"></el-button>
                            <el-button class="no-bg edit" @click="openEditDialog(scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="openDeleteDialog(scope.row)"></el-button>
                        </template>
                    </el-table-column>
                    <el-table-column v-else :label="$t('general.action')" :width="70">
                        <template slot-scope="scope">
                            <el-button class="no-bg detail" @click="openDetailDialog(scope.row.id)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
                <el-dialog :title="$t('general.detail')" width="50%" :visible.sync="dialog.visible" :show-close="false" v-loading="dialog.isLoading" @close="closeDialog(null,'detail')">
                    <div class="tabs-contain carDetail">
                        <el-tabs v-model="dialog.active" @tab-click="handleTabClick">
                            <el-tab-pane :label="$t('cars.carType')" name="carType">
                                <div class="carType">
                                    <div class="item">
                                        <div class="label">{{ $t('cars.maker') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.carBrand || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.model') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.carModel || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.trim') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.trim || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.year') }}</div>
                                        <div class="info">{{ dialog.info.carTypeInfo.year || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.picture') }}</div>
                                        <div class="info"><img :src="dialog.info.carTypeInfo.imageUrl" width="360" height="200"></div>
                                    </div>
                                </div>
                            </el-tab-pane>
                            <el-tab-pane :label="$t('cars.battery')" name="battery">
                                <div class="battery">
                                    <div class="item">
                                        <div class="label">{{ $t('cars.acPlug') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.acPlug || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.acPower') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.acPower ? dialog.info.carBatteryInfo.acPower + ' KW': '-' }}</div>
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
                                        <div class="info">{{ dialog.info.carBatteryInfo.dcPower ? dialog.info.carBatteryInfo.dcPower +' kW' : '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.chargeSpeed') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.chargeSpeed || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.chargeTime') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.chargeTime || '-' }}</div>
                                    </div>
                                    <div class="item">
                                        <div class="label">{{ $t('cars.chargePlugLocation') }}</div>
                                        <div class="info">{{ dialog.info.carBatteryInfo.chargePlugLocation || '-' }}</div>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-dialog>
                <UpdateCars :show="createCarsDialog.show" :dialogType="'create'" @close="closeDialog(null,'create')"></UpdateCars>
                <DeleteCars :show="deleteCarsDialog.show" :id="deleteCarsDialog.id" :make="deleteCarsDialog.make" :carModel="deleteCarsDialog.model" :trim="deleteCarsDialog.trim" @close="(e)=>closeDialog(e,'delete')"></DeleteCars>
                <UpdateCars :show="editCarsDialog.show" :data="editCarsDialog.data" :dialogType="'edit'" @close="closeDialog(null,'edit')"></UpdateCars>

            </div>
        </div>
    </div>
</template>

<script>
import {
    $HTTP_getCarBrandListForSelect,
    $HTTP_getCarList,
    $HTTP_getCarInfo,
    $HTTP_getCarModelListForSelect,
} from "@/api/api";
import { setScrollBar } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import UpdateCars from "@/views/setting/updateCars";
import DeleteCars from "@/views/setting/deleteCars";

export default {
    components: {
        UpdateCars,
        DeleteCars,
    },
    data() {
        return {
            lang: this.$store.state.lang,
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                carBrand: "",
                carModel: "",
                tmpSearch: "",
            },
            carBandList: {
                isLoading: false,
                data: {},
            },
            carModelList: {
                isLoading: false,
                data: {},
            },
            isLoading: false,
            tableData: [],
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 0,
            dialog: {
                visible: false,
                isLoading: false,
                active: "carType",
                carId: "",
                info: {
                    carTypeInfo: {
                        carBrand: "",
                        carModel: "",
                        trim: "",
                        year: "",
                        imageUrl: "",
                    },
                    carBatteryInfo: {
                        acPlug: "",
                        acPower: "",
                        acPhase: "",
                        dcPlug: "",
                        dcPower: "",
                        chargePlugLocation: "",
                        chargeSpeed: "",
                        chargeTime: "",
                    },
                },
            },
            createCarsDialog: {
                show: false,
                isLoading: false,
            },
            deleteCarsDialog: {
                id: null,
                make: "",
                model: "",
                trim: "",
                isLoading: false,
                show: false,
            },
            editCarsDialog: {
                show: false,
                isLoading: false,
                data: {},
            },
        };
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchCarBandList();
        this.fetchData();
    },
    methods: {
        fetchCarBandList() {
            const that = this;
            this.carBandList.isLoading = true;
            let param = {
                limit: 200,
            };
            $HTTP_getCarBrandListForSelect(param)
                .then((res) => {
                    that.carBandList.isLoading = false;
                    if (res?.data?.length > 0) {
                        that.carBandList.data = res.data;
                    } else {
                        that.carBandList.data = {};
                        this.$message({ type: "warning", message: i18n.t("noData") });
                    }
                })
                .catch((err) => {
                    console.log("carBandList", err);
                    that.carBandList.data = {};
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        fetchCarModelList() {
            const that = this;
            // empty the model selected on make change
            that.filter.carModel = "";

            this.carModelList.isLoading = true;
            let params = { make: this.filter.carBrand };
            $HTTP_getCarModelListForSelect(params)
                .then((res) => {
                    that.carModelList.isLoading = false;
                    if (res?.data?.length > 0) {
                        that.carModelList.data = res.data;
                    } else {
                        that.carModelList.data = {};
                        this.$message({ type: "warning", message: i18n.t("noData") });
                    }
                })
                .catch((err) => {
                    console.log("carModelList", err);
                    that.carModelList.data = {};
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        fetchData(type) {
            this.isLoading = true;
            let param = {
                page: this.page,
                limit: this.limit,
            };
            if (this.filter.carBrand) {
                param.make = this.filter.carBrand;
            }
            if (this.filter.carModel) {
                param.model = this.filter.carModel;
            }

            if (type === "models") {
                this.page = 1;
                param["page"] = 1;
            }

            $HTTP_getCarList(param)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if(this.filter.carBrand || this.filter.carModel){
                            this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        fetchCarInfo() {
            const that = this;
            let param = {
                carId: this.dialog.carId,
            };
            this.dialog.isLoading = true;
            $HTTP_getCarInfo(param)
                .then((data) => {
                    that.dialog.isLoading = false;
                    if (data) {
                        let _carTypeInfo = {};
                        _carTypeInfo["carBrand"] = data.make;
                        _carTypeInfo["carModel"] = data.model;
                        _carTypeInfo["trim"] = data.trim;
                        _carTypeInfo["year"] = data.year;
                        _carTypeInfo["imageUrl"] = data.imageUrl;
                        let _carBatteryInfo = {};
                        _carBatteryInfo["acPlug"] = data.plugType;
                        _carBatteryInfo["acPower"] = data.chargePower;
                        _carBatteryInfo["acPhase"] = data.chargePhase;
                        _carBatteryInfo["dcPlug"] = data.fastChargePlugType;
                        _carBatteryInfo["dcPower"] = data.fastChargePower;
                        _carBatteryInfo["chargePlugLocation"] = data.plugLocation;
                        _carBatteryInfo["chargeSpeed"] = data.chargeSpeed;
                        _carBatteryInfo["chargeTime"] = data.chargeTime;

                        that.dialog.info.carTypeInfo = Object.assign({}, _carTypeInfo);
                        that.dialog.info.carBatteryInfo = Object.assign({}, _carBatteryInfo);
                    } else {
                        this.$message({ type: "warning", message: i18n.t("noData") });
                    }
                })
                .catch((err) => {
                    console.log("chargeBoxList", err);
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        handleCarBandChange() {
            if (this.filter.carBrand !== "") {
                this.fetchCarModelList();
            } else {
                this.filter.carModel = "";
                this.carModelList.data = {};
            }
            this.page = 1;
            this.fetchData();
        },
        openDetailDialog(carId) {
            this.dialog.carId = carId;
            this.dialog.info = {
                carTypeInfo: {
                    carBrand: "",
                    carModel: "",
                    trim: "",
                    year: "",
                    imageUrl: "",
                },
                carBatteryInfo: {
                    acPlug: "",
                    acPower: "",
                    acPhase: "",
                    dcPlug: "",
                    dcPower: "",
                    chargePlugLocation: "",
                    chargeSpeed: "",
                    chargeTime: "",
                },
            };
            this.active = "carType";
            this.fetchCarInfo();
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openCreateDialog() {
            this.createCarsDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openDeleteDialog(data) {
            this.deleteCarsDialog.id = data.id;
            this.deleteCarsDialog.make = data.make;
            this.deleteCarsDialog.model = data.model;
            this.deleteCarsDialog.trim = data.trim;
            this.deleteCarsDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openEditDialog(data) {
            this.editCarsDialog.show = true;
            this.editCarsDialog.data = data;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleTabClick() {},
        closeDialog(e, dialog) {
            if (dialog === "create") {
                this.createCarsDialog.show = false;
            } else if (dialog === "delete") {
                this.deleteCarsDialog.show = false;
                // if final item is deleted take to previous page if present
                if (e && this.tableData.length === 1) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    } else {
                        this.page = 1;
                    }
                }
            } else if (dialog === "edit") {
                this.editCarsDialog.show = false;
            }
            this.fetchData();

            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
    },
};
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
        color: #5a607f;
        letter-spacing: 0;
    }
    .carDetail {
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 200px;
                font-size: 1rem;
                color: #525e69;
                letter-spacing: 0;
                vertical-align: top;
            }
            .info {
                display: inline-block;
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151e25;
                letter-spacing: 0;
            }
        }
    }
}
</style>
