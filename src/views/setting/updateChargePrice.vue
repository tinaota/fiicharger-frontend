<template>
    <el-dialog :title="dialogType==='create'?$t('general.create'):$t('general.modify')" width="30%" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <el-form ref="updateChargePriceForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="name">
                        <div class="label">{{ $t('general.name') }}</div>
                        <el-input v-model="dialog.name"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="currencyType">
                        <div class="label">{{ $t('general.currency') }}</div>
                        <el-select class="select-small" v-model="dialog.currencyType">
                            <el-option v-for="(item, key) in currencyList" :label="getSymbols(item)" :key="key" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="onPeak.type">
                        <div class="label">
                            {{ "● " + $t('chargingStation.onPeak') }}
                            <br />
                            <span class="hint">{{ "  " + $t('chargingStation.onPeakHint') }}</span>
                        </div>
                        <div class="elecRateItem">
                            <el-input-number v-model="dialog.onPeak.rate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                            <span>/</span>
                            <el-select class="select-small" v-model="dialog.onPeak.type">
                                <el-option v-for="(item, key) in rateList" :label="getSymbols(item)" :key="key" :value="item"></el-option>
                            </el-select>
                        </div>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="offPeak.type">
                        <div class="label">
                            {{ "● " + $t('chargingStation.offPeak') }}
                            <br />
                            <span class="hint">{{ "  " + $t('chargingStation.offPeakHint') }}</span>
                        </div>
                        <div class="elecRateItem">
                            <el-input-number v-model="dialog.offPeak.rate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                            <span>/</span>
                            <el-select class="select-small" v-model="dialog.offPeak.type">
                                <el-option v-for="(item, key) in rateList" :label="getSymbols(item)" :key="key" :value="item"></el-option>
                            </el-select>
                        </div>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                    <div class="elecRateItem">
                        <el-input-number v-model="dialog.occupancyRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                        <span>/</span>
                        <el-tooltip content="min" placement="top" effect="light" popper-class="custom">
                            <el-input-number v-model="dialog.occupancyPeriodMinutes" :precision="2" :step="1" :min="0" controls-position="right"></el-input-number>
                        </el-tooltip>
                    </div>
                </div>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updatePrice">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar, transformToSymbols } from "@/utils/function";
import { $HTTP_addChargePrice, $HTTP_updateChargePrice, $HTTP_getRateTypeList, $HTTP_getCurrencyList } from "@/api/api";
import { validateIsEmpty } from "@/utils/validation";
export default {
    props: { show: Boolean, dialogType: String, data: Object },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            dialog: {
                name: "",
                id: null,
                onPeak: {
                    rate: 0,
                    type: "",
                },
                offPeak: {
                    rate: 0,
                    type: "",
                },
                occupancyRate: 0,
                occupancyPeriodMinutes: 0,
                currencyType: "",
            },
            rateList: [],
            currencyList: [],
            rules: {
                name: [{ validator: validateIsEmpty }],
                "onPeak.rate": [{ validator: validateIsEmpty }],
                "onPeak.type": [{ validator: validateIsEmpty }],
                "offPeak.rate": [{ validator: validateIsEmpty }],
                "offPeak.type": [{ validator: validateIsEmpty }],
                occupancyRate: [{ validator: validateIsEmpty }],
                occupancyPeriodMinutes: [{ validator: validateIsEmpty }],
                currencyType: [{ validator: validateIsEmpty }],
            },
        };
    },
    mounted() {
        this.fetchCurrencyList();
        this.fetchRateTypeList();
        const that = this;
        that.visible = that.show;
        that.isUpdate = false;
        if (that.visible) {
            if (that.dialogType === "create") {
                this.$API = $HTTP_addChargePrice;
            } else if (that.dialogType === "edit") {
                this.$API = $HTTP_updateChargePrice;
                if (this.data !== undefined) {
                    this.dialog = { ...this.data };
                }
            }
        }
        that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
    },
    methods: {
        fetchRateTypeList() {
            $HTTP_getRateTypeList()
                .then((res) => {
                    if (res.length > 0) {
                        this.rateList = res;
                    } else {
                        this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                    }
                })
                .catch((err) => {
                    console.log("rateList", err);
                    this.rateList = [];
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        fetchCurrencyList() {
            $HTTP_getCurrencyList()
                .then((res) => {
                    if (res.length > 0) {
                        this.currencyList = res;
                    } else {
                        this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                    }
                })
                .catch((err) => {
                    console.log("currencyList", err);
                    this.currencyList = [];
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        updatePrice() {
            this.$refs.updateChargePriceForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    that.isLoading = true;
                    let params = {};
                    if (that.dialogType === "create") {
                        params = { ...that.dialog };
                        delete params["id"];
                    } else if (that.dialogType === "edit") {
                        params = { ...that.dialog };
                        delete params["updated"];
                        delete params["created"];
                        delete params["status"];
                    }
                    this.$API(params)
                        .then((res) => {
                            that.isLoading = false;
                            if (res) {
                                that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                                that.isUpdate = true;
                                that.visible = false;
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                            that.$message({ type: "warning", message: _errors.toString() });
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.dialog = {
                name: "",
                id: null,
                onPeak: {
                    rate: 0,
                    type: "",
                },
                offPeak: {
                    rate: 0,
                    type: "",
                },
                occupancyRate: 0,
                occupancyPeriodMinutes: 0,
                currencyType: "",
            };

            this.$nextTick(() => {
                this.$refs?.updateChargePriceForm?.clearValidate("name");
                this.$refs?.updateChargePriceForm?.clearValidate("onPeak.rate");
                this.$refs?.updateChargePriceForm?.clearValidate("onPeak.type");
                this.$refs?.updateChargePriceForm?.clearValidate("offPeak.rate");
                this.$refs?.updateChargePriceForm?.clearValidate("offPeak.type");
                this.$refs?.updateChargePriceForm?.clearValidate("occupancyRate");
                this.$refs?.updateChargePriceForm?.clearValidate("occupancyPeriodMinutes");
                this.$refs?.updateChargePriceForm?.clearValidate("currencyType");
            });
            this.$emit("close", this.isUpdate);
        },
    },
};
</script>

<style lang = "scss" scoped>
.elecRateItem {
    display: flex !important;
    span {
        font-size: 26px;
        margin-top: 7px;
    }
}
</style>