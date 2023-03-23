<template>
    <el-dialog :title="$t(`actions.${action}`)" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <!-- choose connector if row data is present else charger id -->
            <p>{{ $t(`actions.${action}Question`,{item:rowData!==undefined && rowData.id!==undefined? rowData.id: ocppId}) }}</p>
            <!-- only show id tag list for start/stop transaction -->
            <div v-if="action==='startConnectorTransaction'">
                <StartTransactionPopup @update="updateParams"></StartTransactionPopup>
            </div>
            <div v-if="action==='reset'">
            <span style="display:block;"> {{ $t('general.resetType') }}</span> 
        <el-select  class="select-small" v-model="selectedReset" @change="updateResetValue"  clearable>
            <el-option v-for="item in reset" :label="$t(`actions.${item}`)" :key="item" :value="item"></el-option>
        </el-select>           
         </div>
            <div v-if="action==='stopConnectorTransaction'" class="item">
                <div class="label">{{ $t('chargingStation.transactionId') }}</div>
                <div class="info">
                    <CommonList placeHolder="chargingStation.transactionId" selectedLabel="name" listType="transaction" :data="{connectorId: rowData.id, chargePointId: chargePointId}" @updateData="getTransactionId"></CommonList>
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
    $HTTP_stopConnectorTransaction,
    $HTTP_deleteAuthLocalList
} from "@/api/api";
import StartTransactionPopup from "@/components/popup/startTransactionPopup";
import CommonList from "@/components/commonList.vue";
import { catchErrors } from "@/utils/function";
export default {
    components: {
        StartTransactionPopup,
        CommonList
    },
    props: {
        show: Boolean,
        chargePointId: String,
        ocppId: String,
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
                transactionId: null
            },
            selectedReset:"softReset",
            reset:[
           "softReset",
           "hardReset"
            ]
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        this.params = {};
        this.params.chargePointId = this.chargePointId;
        if (this.action === "clearCache") {
            this.$API = $HTTP_clearCache;
        } else if (this.action === "reset") {
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
            this.$API = $HTTP_startConnectorTransaction;
        } else if (this.action === "stopConnectorTransaction") {
            this.params.connectorId = this.rowData.id;
            this.$API = $HTTP_stopConnectorTransaction;
        } else if (this.action === "clearList") {
            this.$API = $HTTP_deleteAuthLocalList;
        } else if (this.action === "stopTransactionWithTransactionId") {
            this.params.transactionId = this.rowData.id;
            this.$API = $HTTP_stopConnectorTransaction;
        }
    },
    methods: {
        updateResetValue(value){
        if(value==="hardReset"){
            this.params.type = "Hard";
        }else{
            this.params.type = "Soft"
        }
        },
        callApi() {
            this.$API(this.params)
                .then((res) => {
                    this.checkResponse(res);
                })
                .catch((err) => {
                    this.visible = false;
                    let errorMessage = catchErrors(`${this.action}`, err);
                    this.$message({ type: "warning", message: errorMessage });
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
            } else if (this.action === "clearList") {
                if (res) {
                    this.$message({
                        type: "success",
                        message: i18n.t("sendLocalList.clearListSuccessMsg")
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
        closeDialog() {
            // empty all data when closing popup
            this.$API = null;
            this.idTag = null;
            this.params = {
                chargePointId: "",
                type: "",
                connectorId: null,
                transactionId: null
            };
            this.$emit("close", this.isUpdate);
        },
        updateParams(combinedParams) {
            // update the id tag to check the button above
            this.idTag = combinedParams.idTag;
            // update the parameters
            this.params = { ...this.params, ...combinedParams };
        },
        getTransactionId(id) {
            this.params = { ...this.params, transactionId: id };
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
        margin-bottom: 10px;
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
