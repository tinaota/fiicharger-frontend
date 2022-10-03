<template>
    <el-dialog custom-class="tariff-dialog" :title="dialogType==='create'?$t('general.create'):$t('general.modify')" top="0" width="31%" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <div class="price">
                <h3>{{ $t('menu.price') }}</h3>
                <el-form ref="tariffForm" :rules="rules" :model="formData">
                    <div class="customPriceName">
                        <el-form-item prop="customPriceName" class="customPriceNameItem">
                            <div class="label">{{ $t('general.customPriceName') }}<span style="color:red"><strong>* </strong></span></div>
                            <div class="info">
                                <el-input style="width:100%" v-model="formData.customPriceName"></el-input>
                            </div>
                        </el-form-item>
                    </div>
                    <div class="priceType">
                        <div class="label">{{ $t('general.priceType') }}</div>
                        <div class="info">
                            <el-radio-group v-model="formData.priceType">
                                <el-radio-button v-for="item in priceTypeList" :label="item.value" :key="item.value">{{ $t(`general.${item.name}`) }}</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                    <div class="otherItems">
                        <div class="minMaxPrice">
                            <div class="excludingVAT">
                                <div class="minPrice">
                                    <div class="label">{{ $t('general.minPriceNoVat') }}<span v-if="priceSpecified" style="color:red"><strong>* </strong></span></div>
                                    <div class="info">
                                        <el-input-number v-model="formData.minPrice.excludingVat" :controls="false"> </el-input-number>
                                    </div>
                                </div>
                                <div class="maxPrice">
                                    <div class="label">{{ $t('general.maxPriceNoVat') }}<span v-if="priceSpecified" style="color:red"><strong>* </strong></span></div>
                                    <div class="info">
                                        <el-input-number v-model="formData.maxPrice.excludingVat" :controls="false"></el-input-number>
                                    </div>
                                </div>
                            </div>
                            <div class="includingVAT">
                                <div class="minPrice">
                                    <div class="label">{{ $t('general.minPriceWithVat') }}<span v-if="priceSpecified" style="color:red"><strong>* </strong></span></div>
                                    <div class="info">
                                        <el-input-number v-model="formData.minPrice.includingVat" :controls="false"></el-input-number>
                                    </div>
                                </div>
                                <div class="maxPrice">
                                    <div class="label">{{ $t('general.maxPriceWithVat') }}<span v-if="priceSpecified" style="color:red"><strong>* </strong></span></div>
                                    <div class="info">
                                        <el-input-number v-model="formData.maxPrice.includingVat" :controls="false"></el-input-number>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="dateTimePicker">
                            <el-date-picker class="tariff-date-time-picker" v-model="formData.dateTimeRange" type="datetimerange" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :default-time="['00:00:00', '23:59:59']" :clearable="false"></el-date-picker>
                        </div>
                    </div>
                </el-form>
            </div>
            <hr />
            <div class="pricingSections">
                <PricingSectionsMain @emitPricingSectionDataFromMain="getPricingSectionData"></PricingSectionsMain>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateTariff">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_addTariffs, $HTTP_updateTariffs } from "@/api/api";
// import moment from "moment";
import PricingSectionsMain from "@/components/tariff/pricingSectionsMain.vue";
import { validateIsEmpty } from "@/utils/validation";

export default {
    components: { PricingSectionsMain },
    props: { show: Boolean, dialogType: String, data: Object },
    data() {
        return {
            // default these values on dialog close
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            formData: {
                customPriceName: "",
                priceType: "REGULAR",
                minPrice: {
                    excludingVat: null,
                    includingVat: null
                },
                maxPrice: {
                    excludingVat: null,
                    includingVat: null
                },
                dateTimeRange: []
            },
            priceTypeList: [
                { name: "regular", value: "REGULAR" },
                { name: "adHocPayment", value: "AD_HOC_PAYMENT" },
                { name: "profileCheap", value: "PROFILE_CHEAP" },
                { name: "profileFast", value: "PROFILE_FAST" },
                { name: "profileGreen", value: "PROFILE_GREEN" }
            ],
            dateTimeRange: [],
            pickerOptions: {},
            pricingSectionData: [],
            rules: {
                customPriceName: [{ validator: validateIsEmpty }]
            }
        };
    },
    computed: {
        priceSpecified() {
            return (
                this.formData.minPrice.excludingVat > 0 ||
                this.formData.minPrice.includingVat > 0 ||
                this.formData.maxPrice.excludingVat > 0 ||
                this.formData.maxPrice.includingVat > 0
            );
        }
    },
    mounted() {
        this.visible = this.show;
        this.isUpdate = false;
        console.log(this.dialogType);
        if (this.dialogType === "create") {
            this.$API = $HTTP_addTariffs;
        } else if (this.dialogType === "edit") {
            this.$API = $HTTP_updateTariffs;
        }
        this.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        this.$nextTick(() => {
            setScrollBar(".formVertical", this);
        });
    },
    methods: {
        getPricingSectionData(pricingSectionData) {
            this.pricingSectionData = [...pricingSectionData];
        },
        updateTariff() {
            let params = {
                name: this.formData.customPriceName,
                type: this.formData.priceType,
                elements: this.pricingSectionData,
                minPrice: {
                    excludingVat: this.formData.minPrice.excludingVat,
                    includingVat: this.formData.minPrice.includingVat
                },
                maxPrice: {
                    excludingVat: this.formData.maxPrice.excludingVat,
                    includingVat: this.formData.maxPrice.includingVat
                },
                startDateTime:
                    this.dateTimeRange.length > 1
                        ? new Date(this.dateTimeRange[0]).toISOString()
                        : null,
                endDateTime:
                    this.dateTimeRange.length > 1
                        ? new Date(this.dateTimeRange[1]).toISOString()
                        : null
            };
            this.$refs.tariffForm.validate((valid) => {
                if (valid) {
                    this.$API(params)
                        .then((res) => {
                            if (res) {
                                this.$message({
                                    type: "success",
                                    message:
                                        this.dialogType === "create"
                                            ? i18n.t("general.sucAddMsg")
                                            : i18n.t("general.sucUpdateMsg")
                                });
                                this.isUpdate = true;
                                this.visible = false;
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            this.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.$nextTick(() => {
                this.$refs?.tariffForm?.clearValidate("customPriceName");
            });
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>
<style lang = "scss" scoped>
.formVertical {
    height: 100%;
    max-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    h3 {
        margin-block-start: 0;
        margin-block-end: 0;
    }
    hr,
    .price,
    .pricingSections {
        margin-right: 12px;
        margin-block-start: 0;
        margin-block-end: 0;
    }
    .price {
        margin-bottom: 2px;
        .customPriceName {
            display: flex;
            width: 100%;
            height: 40px;
        }
        .priceType {
            display: flex;
            flex-direction: column;
            margin-bottom: 5px;
            .label {
                margin-bottom: 5px;
            }
            .info {
                display: flex;
            }
        }
        .otherItems {
            display: flex;
            flex-direction: row;
            .minMaxPrice,
            .dateTimePicker {
                width: 50%;
            }
            .minMaxPrice {
                display: flex;
                justify-content: center;
                flex-direction: column;
                .excludingVAT,
                .includingVAT {
                    display: flex;
                    .minPrice,
                    .maxPrice {
                        display: flex;
                        flex-direction: column;
                        .label,
                        .info {
                            margin: 0 5px 5px 0;
                        }
                    }
                }
            }
            .dateTimePicker {
                margin-top: 22px;
                .tariff-date-time-picker {
                    float: right;
                    width: 220px;
                }
            }
        }
    }
}
</style>
