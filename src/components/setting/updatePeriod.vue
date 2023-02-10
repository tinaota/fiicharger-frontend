<template>
    <el-dialog :title="(data.type === 'create') ? $t('general.create') : $t('general.modify')" width="30%" custom-class="inner" :visible.sync="visible" :show-close="false" @close="closeDialog()" append-to-body>
        <div class="right-form formVertical">
            <el-form ref="updateForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="time">
                        <div class="label">{{ $t('chargingProfile.startPeriodInSeconds') }}</div>
                        <el-time-picker :disabled="(data.type === 'create') && data.isFirst" v-model="dialog.time" :picker-options="pickerOptions" format="hh:mm A" value-format="HH:mm">
                        </el-time-picker>
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
import { validatePositiveFloat, validateIsEmpty } from "@/utils/validation";
import moment from "moment";
import { convertToAMorPM } from "@/utils/function";

export default {
    props: {
        show: Boolean,
        data: Object,
        startSchedule: String
    },
    computed: {
        getAmorPmTime() {
            return (item, format) => convertToAMorPM(item, format);
        }
    },
    data() {
        return {
            isUpdate: false,
            visible: false,
            pickerOptions: {
                selectableRange: ""
            },
            dialog: {
                time: "",
                numberPhases: 0,
                limit: 0
            },
            rules: {
                time: [{ validator: validateIsEmpty }],
                limit: [{ validator: validatePositiveFloat }]
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
                        that.dialog = { ...that.data };
                        delete that.dialog.id;
                    } else {
                        if (that.data.isFirst) {
                            that.dialog.startPeriod = 0;
                            that.dialog.time = moment().startOf("day").format("HH:mm");
                        }
                    }
                    if (that.data.startTime) {
                        let _startTime;
                        if (
                            that.data.startTime.includes("AM") ||
                            (that.data?.startTime?.substring(0, 2) === "12" && that.data.startTime.includes("PM"))
                        ) {
                            _startTime = that.data?.startTime?.substring(0, 5) + ":00";
                        } else if (that.data.startTime.includes("PM") && that.data?.startTime?.substring(0, 2) !== "12") {
                            _startTime = parseInt(that.data.startTime.substring(0, 3)) + 12 + ":" + that.data.startTime.substring(3, 5) + ":00";
                        } else {
                            _startTime = that.data.startTime + ":00";
                        }
                        that.pickerOptions.selectableRange = `${_startTime + "-" + "23:59:00"}`;
                    }
                }
            }
        }
    },
    mounted() {},
    methods: {
        checkForm() {
            const that = this;
            this.$refs.updateForm.validate((valid) => {
                if (valid) {
                    let params = { ...that.dialog };
                    if (params.time && params.time !== moment().startOf("day").format("HH:mm")) {
                        var today = moment().startOf("day");
                        let currentHours = params.time?.substring(0, 2);
                        let currentMinutes = params.time?.substring(3, 5);
                        var startTime = moment(today);
                        var curTime = moment(today).add(currentHours, "hours").add(currentMinutes, "minutes");
                        params.startPeriod = curTime.diff(startTime) / 1000;
                    }
                    that.isUpdate = true;
                    params.time = this.getAmorPmTime(params.time, "hh:mm A");
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
                limit: 0
            };
            this.$nextTick(() => {
                this.$refs?.updateForm?.clearValidate("time");
                this.$refs?.updateForm?.clearValidate("limit");
            });
            this.visible = false;
            this.$emit("close", this.isUpdate, this.returnData);
        }
    }
};
</script>

<style lang = "scss" scoped>
@media only screen and (max-width: 1280px) {
    button {
        margin-bottom: 5px;
    }
}
</style>
