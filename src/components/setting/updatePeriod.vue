<template>
    <el-dialog :title="(data.type === 'create') ? $t('general.create') : $t('general.modify')" width="30%" custom-class="inner" :visible.sync="visible" :show-close="false" @close="closeDialog()" append-to-body>
        <div class="right-form formVertical">
            <el-form ref="updateForm" :rules="rules" :model="dialog" style="width:96%">
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
                    <el-form-item prop="limit">
                        <div class="label">{{ $t('chargingProfile.limit') }}</div>
                        <el-input-number v-model="dialog.limit" :precision="1" :step="1" :min="1" controls-position="right"></el-input-number>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="numberPhases">
                        <div class="label">{{ $t('chargingProfile.numberPhases') }}</div>
                        <el-input-number v-model="dialog.numberPhases" :step="1" :min="1" controls-position="right"></el-input-number>
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
import moment from "moment";

export default {
    props: {
        show: Boolean,
        data: Object,
        startSchedule: String
    },
    data() {
        return {
            isUpdate: false,
            visible: false,
            pickerOptions: {
                start: "00:00",
                step: "00:01",
                end: "24:00",
                minTime: "",
                maxTime: "24:00"
            },
            dialog: {
                time: "",
                numberPhases: 0,
                limit: 0,
            },
            rules: {
                time: [{ validator: validateIsEmpty }],
                limit: [{ validator: validatePositiveFloat }],
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
                        delete that.dialog.id;
                    } else {
                        if (that.data.isFirst) {
                            that.dialog.startPeriod = 0;
                            that.dialog.time = "00:00";
                        }
                    }
                    if (that.data.startTime) {
                        that.pickerOptions.minTime = that.data.startTime;
                        that.pickerOptions.start = that.data.startTime;
                    }
                }
            }
        }
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
                        params.startPeriod = curTime.diff(startTime)/1000;
                    }
                        that.isUpdate = true;
                        that.returnData = params;
                        that.visible = false;
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.dialog = {
                time: "",
                numberPhases: 0,
                limit: 0,
            };
            this.$nextTick(() => {
                this.$refs?.updateForm?.clearValidate("time");
                this.$refs?.updateForm?.clearValidate("limit");
            });
            this.visible = false
            this.$emit("close", this.isUpdate, this.returnData);
        },
    },
};
</script>

<style lang = "scss" scoped>
</style>
