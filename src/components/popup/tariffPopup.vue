
<template>
    <el-dialog :title="$t(`menu.tariff`)" width="80%" :visible.sync="visible" custom-class="tariffPopup" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="table-result">
            <el-table :data="data" v-loading="isLoading">
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
                                    <el-table-column prop="price" :label="$t('menu.tariff')" width="200"></el-table-column>
                                    <el-table-column prop="vat" :label="$t('general.vat') + ' (%)'" width="200"></el-table-column>
                                    <el-table-column prop="stepSize" :label="$t('general.stepSize')" width="200"></el-table-column>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="name" :label="$t('general.name')" width="300"></el-table-column>
                <el-table-column prop="currency" :label="$t('general.currency')" width="250"></el-table-column>
                <el-table-column :label="$t('userAccount.createdDate')" width="300">
                    <template slot-scope="scope">
                        {{ scope.row.created?getLocTime(scope.row.created):'' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('general.modified')" width="300">
                    <template slot-scope="scope">
                        {{ scope.row.modified?getLocTime(scope.row.modified):'' }}
                    </template>
                </el-table-column>
                <el-table-column>
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
                </el-table-column>
            </el-table>
        </div>
    </el-dialog>
</template>

<script>
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";

export default {
    props: {
        show: Boolean,
        data: Array
    },
    emits: ["close"],

    data() {
        return {
            visible: false,
            isLoading: false,
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
        this.visible = this.show;
    },
    methods: {
        closeDialog() {
            this.$emit("close", true);
        }
    }
};
</script>
