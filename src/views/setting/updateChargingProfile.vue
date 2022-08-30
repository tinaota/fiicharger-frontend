<template>
    <el-dialog :title="(data.type === 'create') ? $t('chargingProfile.createProfile') : $t('chargingProfile.modifyProfile')" :width="'50%'" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <el-form ref="updateForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="chargingProfileName">
                        <div class="label">{{ $t('chargingProfile.name') }}</div>
                        <el-input v-model="dialog.chargingProfileName"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="maxPower_kW">
                        <div class="label">{{ $t('chargingProfile.maxPower') }}</div>
                        <el-input-number v-model="dialog.maxPower_kW" :precision="1" :step="0.1" :min="0" controls-position="right"></el-input-number>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargingProfilePurpose">
                        <div class="label">{{ $t('chargingProfile.chargingProfilePurpose') }}</div>
                        <el-select class="select-small" v-model="dialog.chargingProfilePurpose" v-loading="profilePurposeList.isLoading">
                            <el-option v-for="item in profilePurposeList.data" :label="item" :key="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargingProfileKind">
                        <div class="label">{{ $t('chargingProfile.chargingProfileKind') }}</div>
                        <el-select class="select-small" v-model="dialog.chargingProfileKind" v-loading="profileKindList.isLoading">
                            <el-option v-for="item in profileKindList.data" :label="item" :key="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="validFrom">
                        <div class="label">{{ $t('chargingProfile.validFrom') }}</div>
                        <el-date-picker v-model="dialog.validFrom" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="validTo">
                        <div class="label">{{ $t('chargingProfile.validTo') }}</div>
                        <el-date-picker v-model="dialog.validTo" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="startSchedule">
                        <div class="label">{{ $t('chargingProfile.startSchedule') }}</div>
                        <el-date-picker v-model="dialog.startSchedule" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="durationInSeconds">
                        <div class="label">{{ $t('general.startTime') }}</div>
                        <el-time-select
                            v-model="dialog.startTime"
                            :picker-options="timePickerOptions"
                            clearable>
                        </el-time-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="description">
                        <div class="label">{{ $t('general.description') }}</div>
                        <el-input type="textarea" v-model="dialog.description" :rows="2"></el-input>
                    </el-form-item>
                </div>
            </el-form>
            <GetPeriod
                :show="visible"
                :chargingProfileId="dialog.chargingProfileId"
                :editable="true"
                :maxPower_kW="dialog.maxPower_kW_orign"
                :isCreate="(data.type === 'create')"
                @handleData="handlePeriodData">
            </GetPeriod>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="checkForm">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {
    setScrollBar,
    transformUtcToLocTime
} from "@/utils/function";
import {
    validateIsEmpty,
    validatePositiveFloat
} from "@/utils/validation";
import {
    $HTTP_addChargingProfile,
    $HTTP_updateChargingProfile
} from "@/api/api";
import GetPeriod from "@/components/setting/getPeriod";
import moment from "moment";
export default {
    props: {
        show: Boolean,
        data: Object,
        profileKindList: Object,
        profilePurposeList: Object,
    },
    components: {
        GetPeriod
    },
    data() {
        return {
            isLoading: false,
            isUpdate: false,
            visible: false,
            dialog: {
                chargingProfileName: "",
                maxPower_kW: 0,
                stackLevel: 1,
                description: "",
                chargingProfilePurpose: "TxDefaultProfile",
                chargingProfileKind: "Absolute",
                recurrencyKind: "Daily",
                validFrom: "",
                validTo: "",
                startSchedule: "",
                chargingRateUnit: "W",
                startTime: ""
            },
            profilePeriodTableVisible: false,
            rules: {
                chargingProfileName: [{ validator: validateIsEmpty}],
                maxPower_kW: [{ validator: validatePositiveFloat }],
                chargingProfilePurpose: [{ validator: validateIsEmpty }],
                chargingProfileKind: [{ validator: validateIsEmpty }]
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() + 86400000 < Date.now();  /// today
                },
            },
            timePickerOptions: {
                start: "00:00",
                step: "00:30",
                end: "24:00",
                maxTime: "24:00"
            }
        };
    },
    watch: {
        show: {
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    if (that.data.type !== "create") {
                        that.dialog = { ...that.data.info};
                        that.dialog.validFrom = transformUtcToLocTime(that.dialog.validFrom);
                        that.dialog.validTo = transformUtcToLocTime(that.dialog.validTo);
                        that.dialog.maxPower_kW_orign = that.dialog.maxPower_kW;
                    }
                    that.$jQuery(".formVertical").length > 0 && that.$jQuery(".formVertical").mCustomScrollbar("destroy");
                    that.$nextTick(() => {
                        setScrollBar(".formVertical", that);
                    });
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
                    params.validFrom = (params.validFrom !== null && params.validFrom !== "") ? new Date(params.validFrom) .toISOString(): null;
                    params.validTo = (params.validTo !== null && params.validTo !== "") ? new Date(params.validTo).toISOString() : null;
                    params.startSchedule = (params.startSchedule !== null && params.startSchedule !== "") ? new Date(params.startSchedule).toISOString() : null;
                    params.transactionId = 0;
                    params.maxPower = params.maxPower_kW * 1000; //kw->w
                    delete params.maxPower_kW;
                    if (params.startTime === null) {
                        params.durationInSeconds = null;
                    } else if (params.startTime) {
                        var today = moment().format("YYYY-MM-DD ");
                        var startTime = moment(today + "00:00");
                        var curTime = moment(today + params.startTime);
                        params.durationInSeconds = curTime.diff(startTime)/1000;
                    }
                    delete params.startTime;
                    if(that.data.type === "create") {
                        that.addProfile(params);
                    } else {
                        that.updateProfile(params);
                    }
                } else {
                    console.log("error submit!!", valid);
                    return false;
                }
            });
        },
        addProfile(params) {
            const that = this;
            if (this.dialog.chargingSchedulePeriods && this.dialog.chargingSchedulePeriods.length) {
                params.chargingSchedulePeriods = this.dialog.chargingSchedulePeriods.map(item => {
                    let period = {
                        powerLimit: item.powerLimit * 1000,
                        numberPhases: item.numberPhases
                    }
                    if (item.time && item.time !== "00:00") {
                        var today = moment().format("YYYY-MM-DD ");
                        var startTime = moment(today + "00:00");
                        var curTime = moment(today + item.time);
                        period.startPeriodInSeconds = curTime.diff(startTime)/1000;
                    } else {
                        period.startPeriodInSeconds = 0;
                    }
                    return period;
                });
            }
            that.isLoading = true;
            $HTTP_addChargingProfile(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.chargingProfileId) {
                        that.$message({ type: "success", message: i18n.t("general.sucAddMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log("addProfile err", err);
                    that.isLoading = false;
                    that.visible = false;
                    that.isUpdate = false;
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({ type: "warning", message: _errors.toString() });
                });
        },
        updateProfile(params) {
            const that = this;
            that.isLoading = true;
            $HTTP_updateChargingProfile(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.chargingProfileId) {
                        that.$message({ type: "success", message: i18n.t("general.sucAddMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log("updateProfile err", err);
                    that.isLoading = false;
                    that.visible = false;
                    that.isUpdate = false;
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({ type: "warning", message: _errors.toString() });
                });
        },
        closeDialog() {
            this.dialog = {
                chargingProfileName: "",
                maxPower_kW: 0,
                stackLevel: 1,
                description: "",
                chargingProfilePurpose: "TxDefaultProfile",
                chargingProfileKind: "Absolute",
                recurrencyKind: "Daily",
                validFrom: "",
                validTo: "",
                startSchedule: "",
                chargingRateUnit: "W",
                startTime: ""
            };
            this.$nextTick(() => {
                this.$refs?.updateForm?.clearValidate("chargingProfileName");
                this.$refs?.updateForm?.clearValidate("maxPower_kW");
                this.$refs?.updateForm?.clearValidate("chargingProfilePurpose");
                this.$refs?.updateForm?.clearValidate("chargingProfileKind");
            });
            this.showPeriod = false;
            this.$emit("close", this.isUpdate);
        },
        handlePeriodData(data) {
            if (this.data.type === 'create') {
                if (data && data.length>0) {
                    this.dialog.chargingSchedulePeriods = data.slice();
                } else if (this.dialog.chargingSchedulePeriods) {
                    delete this.dialog.chargingSchedulePeriods;
                }
            }
        }
    },
};
</script>

<style lang = "scss" scoped>
</style>