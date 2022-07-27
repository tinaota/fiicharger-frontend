<template>
    <el-dialog :title="$t(`actions.${action}`)" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <!-- choose connector if row data is present else charger id -->
            <p>{{ $t(`actions.${action}Question`) }} {{ rowData.id!==undefined? rowData.id: chargePointId }} ?</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="callApi">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {
    $HTTP_clearCache,
    $HTTP_resetChargers,
    $HTTP_updateOccpAvailability,
    $HTTP_unlockConnector
} from "@/api/api";

export default {
    props: {
        show: Boolean,
        chargePointId: String,
        action: String,
        rowData: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            params: {
                chargePointId: "",
                type: "",
                connectorId: null
            }
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        this.params.chargePointId = this.chargePointId;
        if (this.action === "clearCache") {
            this.$API = $HTTP_clearCache;
        } else if (this.action === "hardReset") {
            this.$API = $HTTP_resetChargers;
            this.params.type = "Hard";
        } else if (this.action === "softReset") {
            this.$API = $HTTP_resetChargers;
            this.params.type = "Soft";
        } else if (this.action === "disableConnector") {
            this.params.type = "Inoperative";
            this.params.connectorId = this.rowData.id;
            this.$API = $HTTP_updateOccpAvailability;
        } else if (this.action === "enableConnector") {
            this.params.type = "Operative";
            this.params.connectorId = this.rowData.id;
            this.$API = $HTTP_updateOccpAvailability;
        } else if (this.action === "unlockConnector") {
            this.params.connectorId = this.rowData.id;
            this.$API = $HTTP_unlockConnector;
        }
        console.log(this.action, this.rowData);
    },
    methods: {
        callApi() {
            this.$API(this.params)
                .then((res) => {
                    this.checkResponse(res);
                })
                .catch((err) => {
                    console.log(err);
                    this.visible = false;
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        checkResponse(res) {
            this.isUpdate = true;
            this.visible = false;
            if (this.action === "unlockConnector") {
                if (res === "Unlocked") {
                    this.$message({
                        type: "success",
                        message: i18n.t("actions.unlockConnectorSuccess")
                    });
                } else if (res === "UnlockFailed") {
                    this.$message({
                        type: "warning",
                        message: i18n.t("actions.unlockConnectorFailed")
                    });
                } else if (res === "NotSupported") {
                    this.$message({
                        type: "warning",
                        message: i18n.t("actions.unlockConnectorNotSupported")
                    });
                }
            } else {
                if (res === "Accepted") {
                    this.$message({
                        type: "success",
                        message: i18n.t(`actions.${this.action}Success`)
                    });
                } else {
                    this.$message({
                        type: "success",
                        message: i18n.t(`actions.${this.action}Rejected`)
                    });
                }
            }
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
.formVertical {
    min-height: 50px;
    div {
        min-height: 50px;
    }
    p {
        margin-bottom: 5px;
    }
}
</style>
