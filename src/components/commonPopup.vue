<template>
    <el-dialog :title="$t(`actions.${action}`)" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <!-- choose connector if row data is present else charger id -->
            <p>{{ $t(`actions.${action}Question`,{item:rowData.id!==undefined? rowData.id: chargePointId}) }}</p>
            <!-- only show id tag list for start/stop transaction -->
            <div class="item" v-if="action==='startConnectorTransaction'">
                <div class="label">{{ $t('menu.idTag') }}</div>
                <div class="info">
                    <IdTagList @idTag="getIdTag"></IdTagList>
                </div>
            </div>
        </div>
        <!-- show a different footer in the model depending on the action -->
        <span slot="footer" class="dialog-footer" v-if="action!=='startConnectorTransaction'">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="callApi">{{ $t('general.ok') }}</el-button>
        </span>
        <p style="text-align:center;" v-else>
            <el-button size="small" type="primary" :disabled="idTag===null" @click="callApi">{{ $t(`actions.${action}Button`) }}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import {
    $HTTP_clearCache,
    $HTTP_resetChargers,
    $HTTP_updateOccpAvailability,
    $HTTP_unlockConnector,
    $HTTP_startConnectorTransaction,
    $HTTP_stopConnectorTransaction
} from "@/api/api";
import IdTagList from "@/components/idTagList.vue";
export default {
    components: {
        IdTagList
    },
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
            idTag: null,
            params: {
                chargePointId: "",
                type: "",
                connectorId: null,
                idTag: null
            }
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        this.params = {};
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
        } else if (this.action === "startConnectorTransaction") {
            this.params.connectorId = this.rowData.id;
            this.params.idTag = this.idTag;
            this.$API = $HTTP_startConnectorTransaction;
        } else if (this.action === "stopConnectorTransaction") {
            this.params.connectorId = this.rowData.id;
            this.$API = $HTTP_stopConnectorTransaction;
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
            //check based on the action and the response type
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
                } else if (res === "Scheduled") {
                    this.$message({
                        type: "success",
                        message: i18n.t(`actions.${this.action}Scheduled`)
                    });
                } else if (res === "NoAction") {
                    this.$message({
                        type: "success",
                        message: i18n.t(`actions.${this.action}NoAction`)
                    });
                } else {
                    this.$message({
                        type: "success",
                        message: i18n.t(`actions.${this.action}Rejected`)
                    });
                }
            }
        },
        getIdTag(idTag) {
            console.log(idTag);
            // set id tag as a parameter directly
            this.idTag = idTag;
            this.params.idTag = idTag;
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
    .item {
        display: flex;
        width: 100%;
        height: 40px;
        justify-content: space-between;
        margin-top: 5px;
    }
}
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
