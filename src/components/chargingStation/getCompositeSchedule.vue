<template>
    <el-dialog :title="$t('chargingStation.getCompositeSchedule')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.chargePointId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingProfile.scheduleDuration') }}</div>
                <el-time-select v-model="param.time" :picker-options="pickerOptions">
                </el-time-select>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="getCompositeSchedule()">{{ $t('general.perform') }}</el-button>
        </p>
        <ShowCompositeSchedule v-show="showCompositeScheduleDialog.visible" :show="showCompositeScheduleDialog.visible" :data="showCompositeScheduleDialog.data"></ShowCompositeSchedule>
    </el-dialog>
</template>

<script>
import { $HTTP_getCompositeSchedule } from "@/api/api";
import ShowCompositeSchedule from "@/components/chargingStation/showCompositeSchedule";
import moment from "moment";
export default {
    components: {
        ShowCompositeSchedule
    },
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            param: {
                time: ""
            },
            pickerOptions: {
                start: "00:00",
                step: "00:01",
                end: "24:00",
                minTime: "",
                maxTime: "24:00"
            },
            showCompositeScheduleDialog: {
                visible: false,
                data: {}
            }
        };
    },
    watch: {
        show: {
            handler() {
                this.visible = this.show;
            }
        }
    },
    methods: {
        getCompositeSchedule() {
            const that = this;
            let params = {
                chargePointId: that.data.chargePointId,
                connectorId: 0,
                duration: 0
            };
            if (this.param.time && this.param.time !== "00:00") {
                var today = moment().format("YYYY-MM-DD ");
                var startTime = moment(today + "00:00");
                var curTime = moment(today + this.param.time);
                params.duration = curTime.diff(startTime) / 1000;
            }
            that.isLoading = true;
            that.showCompositeScheduleDialog.data = {};
            $HTTP_getCompositeSchedule(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.status === "Accepted") {
                        that.visible = true;
                        that.showCompositeScheduleDialog.data = { ...res };
                        that.showCompositeScheduleDialog.data.name =
                            that.data.name;
                        that.showCompositeScheduleDialog.data.chargePointId =
                            that.data.chargePointId;
                        that.showCompositeScheduleDialog.visible = true;
                    } else {
                        that.visible = false;
                        that.$message({
                            type: "warning",
                            message: i18n.t(
                                "actions.getCompositeScheduleFaulted"
                            )
                        });
                    }
                })
                .catch((err) => {
                    console.log("getCompositeSchedule", err);
                    that.visible = false;
                    that.isLoading = false;
                    let _errors = err?.data?.errors
                        ? Object.values(err?.data?.errors)
                        : err?.data;

                    that.$message({
                        type: "warning",
                        message: _errors.toString()
                    });
                });
        },
        closeDialog() {
            this.param = {
                time: ""
            };
            this.$emit("close");
        }
    }
};
</script>

<style lang = "scss" scoped>
.el-button {
    background: #0263ff;
    color: #fff;
    border: unset;
    font-size: 1rem;
    width: 130px;
    height: 50px;
    border-radius: 6px;
    text-align: center;
}
</style>
