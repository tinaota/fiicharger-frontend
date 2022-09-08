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
                <div class="info">
                    <el-input-number style="width:100%" v-model="param.duration" :step="10" :min="0" controls-position="right"></el-input-number>
                </div>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="getCompositeSchedule()">{{ $t('general.perform') }}</el-button>
        </p>
        <ShowCompositeSchedule v-show="showCompositeScheduleDialog.visible" :show="showCompositeScheduleDialog.visible" :data="showCompositeScheduleDialog.data" @close="changeShowCompositeScheduleStatus"></ShowCompositeSchedule>
    </el-dialog>
</template>

<script>
import { $HTTP_getCompositeSchedule } from "@/api/api";
import ShowCompositeSchedule from "@/components/chargingStation/showCompositeSchedule";
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
                duration: 86400
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
            if (this.param.duration) {
                params.duration = this.param.duration;
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
                duration: 86400
            };
            this.$emit("close");
        },
        changeShowCompositeScheduleStatus() {
            this.showCompositeScheduleDialog.visible = false;
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

.dialogForm {
    .item {
        display: flex;
        width: 100%;
        height: 40px;
        justify-content: space-between;
        margin-top: 5px;
        .info {
            width: 180px;
        }
    }
}
</style>
