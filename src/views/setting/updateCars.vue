<template>
    <el-dialog :title="dialogType==='create'?$t('general.create'):$t('general.modify')" width="400px" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeCreateDialog()">
        <div class="formVertical">
            <el-form ref="addCarsForm" :rules="rules" :model="param" style="width:96%">

                <div class="form-item">
                    <el-form-item prop="make">
                        <div class="label">{{ $t('cars.maker') }}</div>
                        <el-input v-model="param.make"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="model">
                        <div class="label">{{ $t('cars.model') }}</div>
                        <el-input v-model="param.model"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="trim">
                        <div class="label">{{ $t('cars.trim') }}</div>
                        <el-input v-model="param.trim"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="year">
                        <div class="label">{{ $t('cars.year') }}</div>
                        <el-select class="select-small" :placeholder="$t('cars.year')" v-model="param.year" filterable clearable>
                            <el-option v-for="(item, key) in years" :label="item" :key="key" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="plugType">
                        <div class="label">{{ $t('cars.acPlug') }}</div>
                        <el-input v-model="param.plugType"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="plugLocation">
                        <div class="label">{{ $t('cars.chargePlugLocation') }}</div>
                        <el-input v-model="param.plugLocation"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargePower">
                        <div class="label">{{ $t('cars.acPower') }} (kW)</div>
                        <el-input v-model.number="param.chargePower" type="number"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargePhase">
                        <div class="label">{{ $t('cars.aCPhases') }}</div>
                        <el-input v-model.number="param.chargePhase" type="number"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargeTime">
                        <div class="label">{{ $t('cars.chargeTime') }}</div>
                        <el-input v-model.number="param.chargeTime" type="number"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargeSpeed">
                        <div class="label">{{ $t('cars.chargeSpeed') }}</div>
                        <el-input v-model.number="param.chargeSpeed" type="number"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="fastChargePlugType">
                        <div class="label">{{ $t('cars.dcPlug') }}</div>
                        <el-input v-model="param.fastChargePlugType"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="fastChargePower">
                        <div class="label">{{ $t('cars.dcPower') }}(kW)</div>
                        <el-input v-model.number="param.fastChargePower" type="number"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="imageUrl">
                        <div class="label">{{ $t('cars.picture') }}</div>
                        <el-input v-model="param.imageUrl"></el-input>
                    </el-form-item>
                </div>
            </el-form>
        </div>

        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateCars">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_addCars, $HTTP_updateCars } from "@/api/api";

import { validateIsEmpty } from "@/utils/validation";
export default {
    props: { show: Boolean, dialogType: String, data: Object },
    data() {
        return {
            lang: "",

            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            param: {
                make: "",
                model: "",
                trim: "",
                year: null,
                plugType: "",
                plugLocation: "",
                chargePower: null,
                chargePhase: null,
                chargeTime: null,
                chargeSpeed: null,
                fastChargePlugType: "",
                fastChargePower: null,
                imageUrl: "",
            },
            rules: {
                make: [{ validator: validateIsEmpty }],
                model: [{ validator: validateIsEmpty }],
                trim: [{ validator: validateIsEmpty }],
                year: [{ validator: validateIsEmpty }],
                plugType: [{ validator: validateIsEmpty }],
                plugLocation: [{ validator: validateIsEmpty }],
                chargePower: [{ validator: validateIsEmpty }],
                chargePhase: [{ validator: validateIsEmpty }],
                chargeTime: [{ validator: validateIsEmpty }],
                chargeSpeed: [{ validator: validateIsEmpty }],
                fastChargePlugType: [{ validator: validateIsEmpty }],
                fastChargePower: [{ validator: validateIsEmpty }],
                imageUrl: [{ validator: validateIsEmpty }],
            },
        };
    },
    created() {
        this.lang = window.localStorage.getItem("fiics-lang");
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    if (that.dialogType === "create") {
                        this.$Api = $HTTP_addCars;
                    } else if (that.dialogType === "edit") {
                        this.$Api = $HTTP_updateCars;
                        if (this.data !== undefined) {
                            this.param = { ...this.data };
                        }
                    }
                }
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    methods: {
        closeCreateDialog() {
            this.param = {
                make: "",
                model: "",
                trim: "",
                year: null,
                plugType: "",
                plugLocation: "",
                chargePower: null,
                chargePhase: null,
                chargeTime: null,
                chargeSpeed: null,
                fastChargePlugType: "",
                fastChargePower: null,
                imageUrl: "",
            };

            this.$nextTick(() => {
                this.$refs?.addCarsForm?.clearValidate("make");
                this.$refs?.addCarsForm?.clearValidate("model");
                this.$refs?.addCarsForm?.clearValidate("trim");
                this.$refs?.addCarsForm?.clearValidate("year");
                this.$refs?.addCarsForm?.clearValidate("plugType");
                this.$refs?.addCarsForm?.clearValidate("plugLocation");
                this.$refs?.addCarsForm?.clearValidate("chargePower");
                this.$refs?.addCarsForm?.clearValidate("chargePhase");
                this.$refs?.addCarsForm?.clearValidate("chargeTime");
                this.$refs?.addCarsForm?.clearValidate("chargeSpeed");
                this.$refs?.addCarsForm?.clearValidate("fastChargePlugType");
                this.$refs?.addCarsForm?.clearValidate("fastChargePower");
                this.$refs?.addCarsForm?.clearValidate("imageUrl");
            });

            this.$emit("close", this.isUpdate);
        },
        updateCars() {
            this.$refs.addCarsForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    let params;
                    if (that.dialogType === "create") {
                        params = that.param;
                    } else if (that.dialogType === "edit") {
                        // params = remove the same key and value pairs
                        // only send the edited value
                        for (const [key, value] of Object.entries(that.param)) {
                            if (that.data[`${key}`] === value && key !== "id") {
                                delete that.param[`${key}`];
                            }
                        }
                        params = that.param;
                    }
                    that.isLoading = true;
                    this.$Api(params)
                        .then((data) => {
                            that.isLoading = false;
                            if (data) {
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
    },
    computed: {
        years() {
            const year = new Date().getFullYear();
            return Array.from({ length: year - 1990 }, (value, index) => year - index + 1);
        },
    },
};
</script>

<style lang = "scss">
.el-dialog.pwd .el-dialog__body {
    height: 50vh;
}
.el-input__inner {
    padding: 0 0 0 15px;
}
</style>