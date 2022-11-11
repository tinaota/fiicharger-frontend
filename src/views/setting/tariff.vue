<template>
    <div class="tariff scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.tariff') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input :placeholder="$t('general.name')" v-model="filter.tariffName" @change="fetchData()" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select class="select-small long" :placeholder="$t('general.type')" v-model="filter.tariffType" @change="fetchData()" filterable clearable>
                        <el-option v-for="(item, idx) in filter.tariffTypeList" :label="$t(`general.${item.name}`)" :key="idx" :value="item.value"></el-option>
                    </el-select>
                    <!-- <el-date-picker class="tariff-date-time" v-model="filter.startDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.startDateTimeAfter')" @change="fetchData()">
                    </el-date-picker>
                    <el-date-picker class="tariff-date-time" v-model="filter.startDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.startDateTimeBefore')" @change="fetchData()">
                    </el-date-picker>
                    <el-date-picker class="tariff-date-time" v-model="filter.endDateTimeAfter" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.endDateTimeAfter')" @change="fetchData()">
                    </el-date-picker>
                    <el-date-picker class="tariff-date-time" v-model="filter.endDateTimeBefore" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :clearable="true" :placeholder="$t('general.endDateTimeBefore')" @change="fetchData()">
                    </el-date-picker> -->
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog('create')"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column type="expand">
                        <template slot-scope="scope" v-if="scope.row.elements">
                            <div v-for="index in scope.row.elements.length" :key="index">
                                <el-table :data="scope.row.elements[index-1].priceComponents">
                                    <el-table-column :label="$t('general.pricingUsage')">
                                        <el-table-column v-if="!scope.row.elements[index-1].restrictions.reservation" :label="$t('general.type')" width="200">
                                            <template slot-scope="scope">
                                                {{$t(`general.${scope.row.type.toLowerCase()}PriceUsage`)}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column v-if="scope.row.elements[index-1].restrictions.reservation && scope.row.elements[index-1].restrictions.reservation==='RESERVATION'" :label="$t('general.type')" width="200">
                                            <template slot-scope="scope">
                                                {{scope.row.type==='FLAT'? $t('general.reservationFlatPriceUsage'):$t('general.reservationTimePriceUsage')}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column v-if="scope.row.elements[index-1].restrictions.reservation && scope.row.elements[index-1].restrictions.reservation==='RESERVATION_EXPIRES'" :label="$t('general.type')" width="200">
                                            <template slot-scope="scope">
                                                {{scope.row.type==='FLAT'? $t('general.reservation_expiresFlatPriceUsage'):$t('general.reservation_expiresTimePriceUsage')}}
                                            </template>
                                        </el-table-column>
                                        <!-- <el-table-column v-if="scope.row.elements[index-1].restrictions.reservation" prop="type" :label="$t('general.reservationUsage')" width="200"></el-table-column>
                                        <el-table-column v-if="scope.row.elements[index-1].restrictions.reservation" :label="$t('general.reservationType')" width="200">{{ scope.row.elements[index-1].restrictions.reservation }}</el-table-column> -->
                                        <el-table-column prop="price" :label="$t('menu.tariff')" width="200"></el-table-column>
                                        <el-table-column prop="vat" :label="$t('general.vat') + ' (%)'" width="200"></el-table-column>
                                        <el-table-column prop="stepSize" :label="$t('general.stepSize')" width="200"></el-table-column>

                                    </el-table-column>
                                </el-table>
                                <!-- <el-table :data="[scope.row.elements[index-1].restrictions]">
                                    <el-table-column :label="$t('general.pricingConditions')"> -->
                                <!-- <el-table-column prop="startTime" :label="$t('general.startTime')" :min-width="1"></el-table-column>
                                        <el-table-column prop="endTime" :label="$t('general.endTime')" :min-width="1"></el-table-column>
                                        <el-table-column prop="startDate" :label="$t('general.startDate')" :min-width="1"></el-table-column>
                                        <el-table-column prop="endDate" :label="$t('general.endDate')" :min-width="1"></el-table-column>
                                        <el-table-column prop="minKwh" :label="$t('general.minKwh')" :min-width="1"></el-table-column>
                                        <el-table-column prop="maxKwh" :label="$t('general.maxKwh')" :min-width="1"></el-table-column>
                                        <el-table-column prop="minCurrent" :label="$t('general.minCurrent')" :min-width="1"></el-table-column>
                                        <el-table-column prop="maxCurrent" :label="$t('general.maxCurrent')" :min-width="1"></el-table-column>
                                        <el-table-column prop="minPower" :label="$t('general.minPower')" :min-width="1"></el-table-column>
                                        <el-table-column prop="maxPower" :label="$t('general.maxPower')" :min-width="1"></el-table-column>
                                        <el-table-column prop="minDuration" :label="$t('general.minDuration')" :min-width="1"></el-table-column>
                                        <el-table-column prop="maxDuration" :label="$t('general.maxDuration')" :min-width="1"></el-table-column>
                                        <el-table-column prop="dayOfWeek" :label="$t('general.dayOfWeek')" :min-width="1"></el-table-column> -->
                                <!-- <el-table-column prop="reservation" :label="$t('chargingStation.reservation')" width="150"></el-table-column>
                                    </el-table-column>
                                </el-table> -->
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" :label="$t('general.name')" width="300"></el-table-column>
                    <el-table-column prop="currency" :label="$t('general.currency')" width="250"></el-table-column>
                    <!-- <el-table-column prop="type" :label="$t('general.type')" width="200"></el-table-column> -->
                    <!-- <el-table-column :min-width="2" :label="$t('general.minPrice')">
                        <el-table-column :label="$t('general.excludingVat')" :min-width="1">
                            <template slot-scope="scope">
                                {{ scope.row.minPrice? scope.row.minPrice.excludingVat:'' }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('general.includingVat')" :min-width="1">
                            <template slot-scope="scope">
                                {{ scope.row.minPrice ? scope.row.minPrice.includingVat: '' }}
                            </template>
                        </el-table-column>
                    </el-table-column> -->
                    <!-- <el-table-column :min-width="2" :label="$t('general.maxPrice')">
                        <el-table-column :label="$t('general.excludingVat')" :min-width="1">
                            <template slot-scope="scope">
                                {{ scope.row.maxPrice?scope.row.maxPrice.excludingVat:'' }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('general.includingVat')" :min-width="1">
                            <template slot-scope="scope">
                                {{ scope.row.maxPrice? scope.row.maxPrice.includingVat :'' }}
                            </template>
                        </el-table-column>
                    </el-table-column> -->
                    <!-- <el-table-column :label="$t('general.startDate')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.startDateTime? getLocTime(scope.row.startDateTime) :'' }}
                        </template>
                    </el-table-column> -->
                    <!-- <el-table-column :label="$t('general.endDate')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.startDateTime? getLocTime(scope.row.endDateTime) :'' }}
                        </template>
                    </el-table-column> -->
                    <el-table-column :label="$t('userAccount.createdDate')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.created?getLocTime(scope.row.created):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.modified')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.modified?getLocTime(scope.row.modified):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" width="450" v-if="permissionEditAble">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit" @click="openDialog('edit', scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="openDialog('delete',scope.row)"></el-button>
                            <el-tooltip placement="top" popper-class="tableInfoTooltip">
                                <div slot="content">
                                    <el-table :data="tableInfoData">
                                        <el-table-column prop="type" :label="$t('general.type')" width="200"> </el-table-column>
                                        <el-table-column prop="price" :label="$t('menu.tariff')" width="150"> </el-table-column>
                                        <el-table-column prop="stepSize" :label="$t('general.stepSize') + ' ('+ $t('general.billedPer') + ')'" width="150"> </el-table-column>
                                    </el-table>
                                </div>
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
                <UpdateTariff v-if="createDialog.show" :show="createDialog.show" :dialogType="'create'" @close="closeDialog(null,'create')"></UpdateTariff>
                <UpdateTariff v-if="editDialog.show" :show="editDialog.show" :dialogType="'edit'" :data="editDialog.data" @close="closeDialog(null,'edit')"></UpdateTariff>
                <DeleteTariff v-if="deleteDialog.show" :show="deleteDialog.show" :data="deleteDialog.data" :dialogType="'delete'" @close="(e)=>closeDialog(e,'delete')"></DeleteTariff>
            </div>
        </div>
    </div>
</template>
<script>
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { $HTTP_getTarrifs } from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import DeleteTariff from "@/views/setting/deleteTariff";
import UpdateTariff from "@/views/setting/updateTariff";
import i18n from "../../lang/lang";

export default {
    components: {
        DeleteTariff,
        UpdateTariff
    },
    data() {
        return {
            isDark: this.$store.state.darkTheme,
            permissionEditAble: this.$store.state.permissionEditable,
            tableData: [],
            isLoading: false,
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            createDialog: {
                show: false,
                isLoading: false
            },
            editDialog: {
                show: false,
                isLoading: false,
                data: {}
            },
            deleteDialog: {
                isLoading: false,
                show: false,
                data: {}
            },
            filter: {
                tariffName: "",
                tariffType: "",
                tariffTypeList: [
                    { name: "regular", value: "REGULAR" },
                    { name: "adHocPayment", value: "AD_HOC_PAYMENT" },
                    { name: "profileCheap", value: "PROFILE_CHEAP" },
                    { name: "profileFast", value: "PROFILE_FAST" },
                    { name: "profileGreen", value: "PROFILE_GREEN" }
                ],
                startDateTimeAfter: null,
                startDateTimeBefore: null,
                endDateTimeAfter: null,
                endDateTimeBefore: null
            },
            tableInfoData: [
                {
                    type: i18n.t("general.timePriceUsage"),
                    price: i18n.t("general.timeDesc"),
                    stepSize: i18n.t("general.timeStep")
                },
                {
                    type: i18n.t("general.flatPriceUsage"),
                    price: i18n.t("general.flatDesc"),
                    stepSize: null
                },
                {
                    type: i18n.t("general.parking_timePriceUsage"),
                    price: i18n.t("general.timeDesc"),
                    stepSize: i18n.t("general.timeStep")
                },
                {
                    type: i18n.t("general.energyPriceUsage"),
                    price: i18n.t("general.energyDesc"),
                    stepSize: i18n.t("general.energyStep")
                },
                {
                    type: i18n.t("general.reservationTimePriceUsage"),
                    price: i18n.t("general.timeDesc"),
                    stepSize: i18n.t("general.timeStep")
                },
                {
                    type: i18n.t("general.reservationFlatPriceUsage"),
                    price: i18n.t("general.reservationDesc"),
                    stepSize: null
                },
                {
                    type: i18n.t("general.reservation_expiresTimePriceUsage"),
                    price: i18n.t("general.timeDesc"),
                    stepSize: i18n.t("general.timeStep")
                },
                {
                    type: i18n.t("general.reservation_expiresFlatPriceUsage"),
                    price: i18n.t("general.reservationDesc"),
                    stepSize: null
                }
            ]
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        delete setScrollBar(".scroll", this);
        this.fetchData();
    },
    methods: {
        openDialog(type, data) {
            if (type === "create") {
                this.createDialog.show = true;
            } else if (type === "edit") {
                this.editDialog.show = true;
                this.editDialog.data = data;
            } else if (type === "delete") {
                this.deleteDialog.show = true;
                this.deleteDialog.data = data;
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        fetchData() {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit,
                IsDescending: false,
                OrderBy: "Name"
            };
            if (this.filter.tariffName) {
                params.Name = this.filter.tariffName;
            }
            if (this.filter.tariffType) {
                params.Type = this.filter.tariffType;
            }
            if (this.filter.startDateTimeAfter) {
                params.StartDateTimeAfter = new Date(
                    this.filter.startDateTimeAfter
                ).toISOString();
            }
            if (this.filter.startDateTimeBefore) {
                params.StartDateTimeBefore = new Date(
                    this.filter.startDateTimeBefore
                ).toISOString();
            }
            if (this.filter.endDateTimeAfter) {
                params.EndDateTimeAfter = new Date(
                    this.filter.endDateTimeAfter
                ).toISOString();
            }
            if (this.filter.endDateTimeBefore) {
                params.EndDateTimeBefore = new Date(
                    this.filter.endDateTimeBefore
                ).toISOString();
            }
            $HTTP_getTarrifs(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if (
                            this.filter.tariffName ||
                            this.filter.tariffType ||
                            this.filter.startDateTimeAfter ||
                            this.filter.startDateTimeBefore ||
                            this.filter.endDateTimeAfter ||
                            this.filter.endDateTimeBefore
                        ) {
                            this.$message({
                                type: "warning",
                                message: i18n.t("emptyMessage")
                            });
                        } else {
                            this.$message({
                                type: "warning",
                                message: i18n.t("noData")
                            });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        closeDialog(e, dialog) {
            if (dialog === "create") {
                this.createDialog.show = false;
            } else if (dialog === "delete") {
                this.deleteDialog.show = false;

                // if final item is deleted take to previous page if present
                if (e && this.tableData.length === 1) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    } else {
                        this.page = 1;
                    }
                }
            } else if (dialog === "edit") {
                this.editDialog.show = false;
            }
            this.fetchData();

            this.$jQuery(".scroll").mCustomScrollbar("update");
        }
    }
};
</script>


<style lang="scss" scoped>
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
    .el-button.is-disabled,
    .el-button.is-disabled:focus,
    .el-button.is-disabled:hover {
        background-color: transparent;
        &.edit {
            background-image: url("~imgs/ic_modify.png");
        }
        &.delete {
            background-image: url("~imgs/ic_delete.png");
        }
    }
    .tariff-date-time {
        width: 190px;
    }
}

.actions {
    padding: 10px 0px;
    margin: 0px;
}
.actionFunction {
    margin-left: 10px;
}
.fa-info-circle {
    color: #0263ff;
    width: 24px;
    height: 24px;
    font-size: 20px;
    margin-top: 4px;
    margin-left: 10px;
}
</style>
