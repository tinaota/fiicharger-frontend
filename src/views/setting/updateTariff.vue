<template>
    <el-dialog custom-class="tariff-dialog" :title="dialogType==='create'?$t('general.create'):$t('general.modify')" top="0" width="31%" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <div class="price">
                <h3>{{ $t('menu.tariff') }}</h3>
                <el-form ref="tariffForm" :rules="rules" :model="formData">
                    <div class="customName">
                        <el-form-item prop="customPriceName" class="customNameItem">
                            <div class="label">{{ $t('general.customPriceName') }}<span style="color:red"><strong>* </strong></span></div>
                            <div class="info">
                                <el-input style="width:100%" v-model="formData.customPriceName"></el-input>
                            </div>
                        </el-form-item>
                    </div>
                    <div class="customName">
                        <el-form-item prop="currency" class="customNameItem">
                            <div class="label">{{ $t('general.currency') }}<span style="color:red"><strong>* </strong></span></div>
                            <div class="info">
                                <!-- <el-input style="width:100%" v-model="formData.currency"></el-input> -->
                                <el-select style="width:100%" class="select-small" :placeholder="$t(`general.currency`)" v-model="formData.currency" filterable clearable>
                                    <el-option v-for="item in currencyCodesList" :label="item.currency" :key="item.code" :value="item.code"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </div>
                    <!-- <div class="priceType">
                        <div class="label">{{ $t('general.priceType') }}</div>
                        <div class="info">
                            <el-radio-group v-model="formData.priceType">
                                <el-radio-button v-for="item in priceTypeList" :label="item.value" :key="item.value">{{ $t(`general.${item.name}`) }}</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div> -->
                    <!-- <div class="otherItems">
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
                    </div> -->
                </el-form>
            </div>
            <hr />
            <div class="pricingSections">
                <PricingSectionsMain :elements="elements" :currency="formData.currency" @emitPricingSectionDataFromMain="getPricingSectionData"></PricingSectionsMain>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateTariff">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import { $HTTP_addTariffs, $HTTP_updateTariffs } from "@/api/api";
import PricingSectionsMain from "@/components/tariff/pricingSectionsMain.vue";
import { validateIsEmpty } from "@/utils/validation";
import CurrencyCodes from "currency-codes/data";
export default {
    components: { PricingSectionsMain },
    props: { show: Boolean, dialogType: String, data: Object },
    emits: ["close"],
    data() {
        return {
            // default these values on dialog close
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            formData: {
                customPriceName: "",
                currency: "",
                priceType: null,
                minPrice: {
                    excludingVat: 0,
                    includingVat: 0
                },
                maxPrice: {
                    excludingVat: 0,
                    includingVat: 0
                },
                dateTimeRange: []
            },
            id: "",
            priceTypeList: [
                { name: "regular", value: "REGULAR" },
                { name: "adHocPayment", value: "AD_HOC_PAYMENT" },
                { name: "profileCheap", value: "PROFILE_CHEAP" },
                { name: "profileFast", value: "PROFILE_FAST" },
                { name: "profileGreen", value: "PROFILE_GREEN" },
                { name: "none", value: null }
            ],
            pickerOptions: {},
            pricingSectionData: [],
            rules: {
                customPriceName: [{ validator: validateIsEmpty }],
                currency: [{ validator: validateIsEmpty }]
            },
            elements: [],
            currencyCodesList: CurrencyCodes.filter(item=>item.code!=='XXX' && item.code!=='XTS')
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
        if (this.dialogType === "create") {
            this.$API = $HTTP_addTariffs;
        } else if (this.dialogType === "edit") {
            this.$API = $HTTP_updateTariffs;
            this.formData = {
                customPriceName: this.data.name,
                currency: this.data.currency,
                priceType: this.data.type,
                minPrice: {
                    excludingVat: this.data.minPrice.excludingVat,
                    includingVat: this.data.minPrice.includingVat
                },
                maxPrice: {
                    excludingVat: this.data.maxPrice.excludingVat,
                    includingVat: this.data.maxPrice.includingVat
                }
            };

            if (this.data.startDateTime && this.data.endDateTime) {
                this.formData = {
                    ...this.formData,
                    dateTimeRange: [
                        transformUtcToLocTime(this.data.startDateTime),
                        transformUtcToLocTime(this.data.endDateTime)
                    ]
                };
            }
            this.id = this.data.id;
            // update elements before sending
            let modifiedData = [];
            let tempData = [...this.data.elements];
            tempData.map((item) => {
                let tempPriceComponents = item.priceComponents;
                let priceComponentArray = [];
                tempPriceComponents.map((eachPriceComponent) => {
                    if (
                        item.restrictions.reservation &&
                        item.restrictions.reservation === "RESERVATION"
                    ) {
                        let tempObj = { ...eachPriceComponent };
                        tempObj.isReservationTypePresent = true;
                        tempObj.reservationType = "RESERVATION";
                        priceComponentArray.push(tempObj);
                    } else if (
                        item.restrictions.reservation &&
                        item.restrictions.reservation === "RESERVATION_EXPIRES"
                    ) {
                        let tempObj = { ...eachPriceComponent };
                        tempObj.isReservationTypePresent = true;
                        tempObj.reservationType = "RESERVATION_EXPIRES";
                        priceComponentArray.push(tempObj);
                    } else {
                        let tempObj = { ...eachPriceComponent };
                        tempObj.isReservationTypePresent = false;
                        tempObj.reservationType = null;
                        priceComponentArray.push(tempObj);
                    }
                });
                modifiedData = [...modifiedData, ...priceComponentArray];
            });
            let finalModifiedObject = {};
            finalModifiedObject.priceComponents = modifiedData;
            this.elements = [finalModifiedObject];
        }
        this.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        this.$nextTick(() => {
            setScrollBar(".formVertical", this);
        });
    },
    methods: {
        getPricingSectionData(pricingSectionData) {
            let modifiedData = [];
            pricingSectionData.map((item) => {
                let tempPriceComponents = item.priceComponents;

                let noReservationArray = [];
                let reservationExpiresArray = [];
                let reservationArray = [];

                tempPriceComponents.map((eachPriceComponent) => {
                    if (
                        eachPriceComponent.isReservationTypePresent &&
                        eachPriceComponent.reservationType === "RESERVATION"
                    ) {
                        // remove after getting types and dont mutate an obj
                        let tempObj = { ...eachPriceComponent };
                        delete tempObj["isReservationTypePresent"];
                        delete tempObj["reservationType"];
                        reservationArray.push(tempObj);
                    } else if (
                        eachPriceComponent.isReservationTypePresent &&
                        eachPriceComponent.reservationType ===
                            "RESERVATION_EXPIRES"
                    ) {
                        let tempObj = { ...eachPriceComponent };
                        delete tempObj["isReservationTypePresent"];
                        delete tempObj["reservationType"];
                        reservationExpiresArray.push(tempObj);
                    } else if (!eachPriceComponent.isReservationTypePresent) {
                        let tempObj = { ...eachPriceComponent };

                        delete tempObj["isReservationTypePresent"];
                        delete tempObj["reservationType"];
                        noReservationArray.push(tempObj);
                    }
                });

                let noReservationObject = {},
                    reservationExpiresObject = {},
                    reservationObject = {};
                if (noReservationArray.length > 0) {
                    noReservationObject.priceComponents = noReservationArray;
                    modifiedData.push(noReservationObject);
                }
                if (reservationExpiresArray.length > 0) {
                    reservationExpiresObject.priceComponents =
                        reservationExpiresArray;
                    reservationExpiresObject.restrictions = {
                        reservation: "RESERVATION_EXPIRES"
                    };
                    modifiedData.push(reservationExpiresObject);
                }
                if (reservationArray.length > 0) {
                    reservationObject.priceComponents = reservationArray;
                    reservationObject.restrictions = {
                        reservation: "RESERVATION"
                    };
                    modifiedData.push(reservationObject);
                }
            });
            this.pricingSectionData = [...modifiedData];
        },
        updateTariff() {
            let params = {
                name: this.formData.customPriceName,
                currency: this.formData.currency,
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
                    this.formData?.dateTimeRange?.length > 1
                        ? new Date(this.formData.dateTimeRange[0]).toISOString()
                        : null,
                endDateTime:
                    this.formData?.dateTimeRange?.length > 1
                        ? new Date(this.formData.dateTimeRange[1]).toISOString()
                        : null
            };
            // for edit
            if (this.dialogType === "edit") {
                params.id = this.id;
            }
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
                            if (err.status === 404) {
                                this.$message({
                                    type: "warning",
                                    message: i18n.t("general.tariffNotFound", {
                                        item: this.data.id
                                    })
                                });
                            } else {
                                this.$message({
                                    type: "warning",
                                    message: i18n.t("error_network")
                                });
                            }
                            this.isUpdate = true;
                            this.visible = false;
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
                this.$refs?.tariffForm?.clearValidate("currency");
            });
            this.formData = {
                customPriceName: "",
                currency: "",
                priceType: "REGULAR",
                minPrice: {
                    excludingVat: 0,
                    includingVat: 0
                },
                maxPrice: {
                    excludingVat: 0,
                    includingVat: 0
                },
                dateTimeRange: []
            };
            this.id = "";
            this.pricingSectionData = [];
            this.elements = [];
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
    hr {
        border-style: none;
        border-top: 1px solid #606266;
    }
    .price {
        margin-bottom: 2px;
        .customName {
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
