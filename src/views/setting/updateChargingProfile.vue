<template>
    <el-dialog :title="(data.type === 'create') ? $t('chargingProfile.createProfile') : $t('chargingProfile.modifyProfile')" :width="'50%'" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <el-form ref="updateForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="name">
                        <div class="label">{{ $t('general.name') }}</div>
                        <el-input v-model="dialog.name"></el-input>
                    </el-form-item>
                </div>
                <!-- <div class="form-item">
                    <el-form-item prop="chargingProfilePurpose">
                        <div class="label">{{ $t('chargingProfile.chargingProfilePurpose') }}</div>
                        <el-select class="select-small" v-model="dialog.chargingProfilePurpose" v-loading="profilePurposeList.isLoading">
                            <el-option v-for="item in profilePurposeList.data" :label="item" :key="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div> -->
                <div class="form-item">
                    <el-form-item prop="chargingProfileKind">
                        <div class="label">{{ $t('chargingProfile.chargingProfileKind') }}</div>
                        <el-select class="select-small" v-model="dialog.chargingProfileKind" v-loading="profileKindList.isLoading" @change="updateDuration(dialog.chargingProfileKind)">
                            <el-option v-for="item in profileKindList.data" :label="item" :key="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <!-- <div class="form-item">
                    <el-form-item prop="scheduleDuration">
                        <div class="label">{{ $t('chargingProfile.scheduleDuration') }}</div>
                            <el-input-number v-model="dialog.scheduleDuration" :step="10" :min="0" controls-position="right"></el-input-number>
                    </el-form-item>
                </div> -->
                <div class="form-item">
                    <el-form-item prop="minChargingRate">
                        <div class="label">{{ $t('chargingStation.elecRateMin') }}</div>
                            <el-input-number v-model="dialog.minChargingRate" :precision="2" :step="1" :min="0" controls-position="right"></el-input-number>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargingRateUnit">
                        <div class="label">{{ $t('chargingProfile.chargingRateUnit') }}</div>
                        <el-select class="select-small" v-model="dialog.chargingRateUnit">
                            <el-option v-for="item in chargingRateUnitList.data" :label="item.name" :key="item.label" :value="item.label"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="startSchedule">
                        <div class="label">{{ $t('chargingProfile.startSchedule') }}</div>
                        <el-date-picker v-model="dialog.startSchedule" type="date" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy" :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </div>
            </el-form>
            <GetPeriod
                :startSchedule="dialog.startSchedule"
                :show="visible"
                :chargingProfileId="dialog.chargingProfileId"
                :chargingSchedulePeriods="dialog.chargingSchedulePeriods"
                :editable="true"
                :isCreate="(data.type === 'create')"
                :chargingProfileKind="dialog.chargingProfileKind"
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
} from "@/utils/function";
import { validateIsEmpty } from "@/utils/validation";
import {
    $HTTP_addChargingProfile,
    $HTTP_updateChargingProfile
} from "@/api/api";
import GetPeriod from "@/components/setting/getPeriod";
import moment from "moment";
export default {
    components: {
        GetPeriod
    },
    props: {
        show: Boolean,
        data: Object,
        profileKindList: Object,
        profilePurposeList: Object,
        chargingRateUnitList: Object
    },
    data() {
        return {
            isLoading: false,
            isUpdate: false,
            visible: false,
            dialog: {
                name: "",
                description: "",
                chargingProfilePurpose: "TxDefaultProfile",
                chargingProfileKind: "Absolute",
                recurrencyKind: "Daily",
                startSchedule: moment().startOf('day').format('YYYY-MM-DD HH:mm'),
                chargingRateUnit: "W",
                minChargingRate: null,
                scheduleDuration: null
            },
            profilePeriodTableVisible: false,
            rules: {
                name: [{ validator: validateIsEmpty}],
                chargingProfilePurpose: [{ validator: validateIsEmpty }],
                chargingProfileKind: [{ validator: validateIsEmpty }]
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() + 86400000 < Date.now();  /// today
                },
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
                        that.dialog.chargingProfilePurpose = "TxDefaultProfile"
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
        updateDuration(selected){
            if(selected==='Recurring'){
                this.dialog.scheduleDuration = 86400
            }else{
                // for Absolute and relative
                this.dialog.scheduleDuration = null
            }
        },
        checkForm() {
            const that = this;
            this.$refs.updateForm.validate((valid) => {
                if (valid) {
                    let params = { ...that.dialog };
                    params.startSchedule = (params.startSchedule !== null && params.startSchedule !== "") ? new Date(params.startSchedule).toISOString() : null;
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
                        numberPhases: item.numberPhases,
                        limit: item.limit
                    }
                    if (item.time && item.time !== "00:00") {
                        var today = moment().format("YYYY-MM-DD ");
                        var startTime = moment(today + "00:00");
                        var curTime = moment(today + item.time);
                        period.startPeriod = curTime.diff(startTime)/1000;
                    } else {
                        period.startPeriod = 0;
                    }
                    return period;
                });
            }
            that.isLoading = true;
            $HTTP_addChargingProfile(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.id) {
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
                    if (res.id) {
                        that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
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
                name: "",
                description: "",
                chargingProfilePurpose: "TxDefaultProfile",
                chargingProfileKind: "Absolute",
                recurrencyKind: "Daily",
                startSchedule: "",
                chargingRateUnit: "W",
                minChargingRate: null,
                scheduleDuration: null
            };
            this.$nextTick(() => {
                this.$refs?.updateForm?.clearValidate("name");
                this.$refs?.updateForm?.clearValidate("chargingProfilePurpose");
                this.$refs?.updateForm?.clearValidate("chargingProfileKind");
            });
            this.showPeriod = false;
            this.$emit("close", this.isUpdate);
        },
        handlePeriodData(data) {
            if (data) {
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
