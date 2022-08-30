<template>
    <el-dialog :title="(data.type === 'create') ? $t('general.create') : $t('general.modify')" width="30%" custom-class="inner" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()" append-to-body>
        <div class="right-form formVertical">
            <el-form ref="updateForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item" v-if="data.type !== 'create'">
                    <el-form-item prop="id">
                        <div class="label">ID</div>
                        <el-input v-model="dialog.chargingSchedulePeriodId"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="time">
                        <div class="label">{{ $t('chargingProfile.startPeriodInSeconds') }}</div>
                        <el-time-select
                            :disabled="(data.type === 'create') && data.isFirst"
                            v-model="dialog.time"
                            :picker-options="pickerOptions">
                        </el-time-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="powerLimit">
                        <div class="label">{{ $t('chargingProfile.maxPower') }}</div>
                        <el-input-number v-model="dialog.powerLimit" :precision="1" :step="0.1" :min="0.1" :max="max" controls-position="right"></el-input-number>
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="checkForm">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {
    validatePositiveFloat,
    validateIsEmpty
} from "@/utils/validation";
import {
    $HTTP_addChargingProfilePeriods,
    $HTTP_updateChargingProfilePeriods,
} from "@/api/api";
import moment from "moment";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            isLoading: false,
            isUpdate: false,
            visible: false,
            pickerOptions: {
                start: "00:00",
                step: "00:30",
                end: "24:00",
                minTime: "",
                maxTime: "24:00"
            },
            dialog: {
                time: "",
                powerLimit: 0,
                numberPhases: 3
            },
            rules: {
                time: [{ validator: validateIsEmpty }],
                powerLimit: [{ validator: validatePositiveFloat }]
            },
            max: undefined,
            returnData: null
        };
    },
    watch: {
        show: {
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                this.returnData = null;
                if (that.visible) {
                    if (that.data.type !== "create") {
                        that.dialog = {...that.data};
                        that.dialog.chargingSchedulePeriodId = that.data.id;
                        delete that.dialog.id;
                    } else {
                        if (that.data.isFirst) {
                            that.dialog.startPeriodInSeconds = 0;
                            that.dialog.time = "00:00";
                        }
                        that.dialog.chargingProfileId = that.data.chargingProfileId;
                    }
                    that.max = that.data.maxPower_kW;
                    that.dialog.powerLimit = that.data.maxPower_kW;
                    if (that.data.startTime) {
                        that.pickerOptions.minTime = that.data.startTime;
                        that.pickerOptions.start = that.data.startTime;
                    }
                }
            }
        },
    },
    mounted() {
    },
    methods: {
        checkForm() {
            const that = this;
            this.$refs.updateForm.validate((valid) => {
                if (valid) {
                    let params = { ...that.dialog };
                    if (params.time && params.time !== "00:00") {
                        var today = moment().format("YYYY-MM-DD ");
                        var startTime = moment(today + "00:00");
                        var curTime = moment(today + params.time);
                        params.startPeriodInSeconds = curTime.diff(startTime)/1000;
                    }
                    if (that.data.isCreate) {
                        that.isUpdate = true;
                        that.returnData = params;
                        that.visible = false;
                    } else {
                        delete params.time;
                        params.powerLimit = params.powerLimit * 1000; //kw -> w
                        if(that.data.type === "create") {
                            that.addPeriod(params);
                        } else {
                            that.updatePeriod(params);
                        }
                    }
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        addPeriod(params) {
            const that = this;
            that.isLoading = true;
            $HTTP_addChargingProfilePeriods(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.id) {
                        that.$message({ type: "success", message: i18n.t("general.sucAddMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log("addPeriod err", err);
                    that.isLoading = false;
                    that.visible = false;
                    that.isUpdate = false;
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({ type: "warning", message: _errors.toString() });
                });
        },
        updatePeriod(params) {
            const that = this;
            that.isLoading = true;
            $HTTP_updateChargingProfilePeriods(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.id) {
                        that.$message({ type: "success", message: i18n.t("general.sucAddMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log("updatePeriod err", err);
                    that.isLoading = false;
                    that.visible = false;
                    that.isUpdate = false;
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({ type: "warning", message: _errors.toString() });
                });
        },
        closeDialog() {
            this.dialog = {
                time: "",
                powerLimit: 0,
                numberPhases: 3
            };
            this.$nextTick(() => {
                this.$refs?.updateForm?.clearValidate("time");
                this.$refs?.updateForm?.clearValidate("powerLimit");
            });
            this.$emit("close", this.isUpdate, this.returnData);
        },
    },
};
</script>

<style lang = "scss" scoped>
</style>