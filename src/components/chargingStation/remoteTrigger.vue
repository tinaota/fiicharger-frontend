<template>
    <el-dialog :title="$t('chargingStation.remoteTrigger')" width="460px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.ocppId }}</div>
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
import { catchErrors } from "@/utils/function";
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
                BootNotification: i18n.t('actions.triggerCommand.bootNotification'),
                DiagnosticsStatusNotification: i18n.t('actions.triggerCommand.diagnosticsStatusNotification'),
                FirmwareStatusNotification: i18n.t('actions.triggerCommand.firmwareStatusNotification'),
                Heartbeat: i18n.t('actions.triggerCommand.heartbeat'),
                MeterValues: i18n.t('actions.triggerCommand.meterValues'),
                StatusNotification: i18n.t('actions.triggerCommand.statusNotification')
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
                        that.isLoading = false;
                        that.visible = false;
                        let errorMessage = catchErrors("remoteTrigger", err);
                        that.$message({ type: "warning", message: errorMessage });
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
