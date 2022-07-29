<template>
    <el-dialog :title="$t('chargingStation.remoteTrigger')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
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
                <div class="label">{{ $t("chargingStation.triggerMsg") }}</div>
                <el-select class="select-small info" v-model="param.requestedMessage" filterable>
                    <el-option v-for="(item, key) in triggerList" :label="item" :key="item" :value="key"></el-option>
                </el-select>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="remoteTrigger">{{ $t('general.perform') }}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import {
    $HTTP_sendTriggerMessage
} from "@/api/api";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            param: {
                requestedMessage: "",
            },
            triggerList: {
                BootNotification: "Boot Notification",
                DiagnosticsStatusNotification: "Diagnostics Status Notification",
                FirmwareStatusNotification: "Firmware Status Notification",
                Heartbeat: "Heartbeat",
                MeterValues: "Meter Values",
                StatusNotification: "Status Notification"
            }
        };
    },
    watch: {
        show: {
            handler() {
                this.visible = this.show;
            }
        },
    },
    mounted() {
    },
    methods: {
        remoteTrigger() {
            if (this.param.requestedMessage === '') {
                this.$message.error(i18n.t("validation.emptyTriggerMsgValidation"));
            } else {
                const that = this;
                let params = {
                    chargePointId: that.data.chargePointId,
                    requestedMessage: that.param.requestedMessage
                };
                that.isLoading = true;
                $HTTP_sendTriggerMessage(params)
                    .then((res) => {
                        that.isLoading = false;
                        switch(res) {
                            case "Accepted":
                                this.$message({ type: "success", message: i18n.t(`actions.triggerMessageAccepted`, {message: that.param.requestedMessage}) });
                                break;
                            case "Rejected":
                                this.$message.error(i18n.t(`actions.triggerMessageRejected`, {message: that.param.requestedMessage}));
                                break;
                            case "NotImplemented":
                                this.$message({ type: "warning", message: i18n.t(`actions.triggerMessageNotImplemented`, {message: that.param.requestedMessage}) });
                                break;
                            default:
                                this.$message({ type: "warning", message: res });
                        }
                        that.visible = false;
                    })
                    .catch((err) => {
                        console.log('remoteTrigger', err)
                        that.isLoading = false;
                        that.visible = false;
                        let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;

                        that.$message({
                                type: "warning",
                                message: _errors.toString()
                            });
                    });
            }
        },
        closeDialog() {
            this.param = {
                requestedMessage: ""
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
