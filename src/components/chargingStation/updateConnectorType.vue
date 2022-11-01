<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{ $t('chargingStation.changeConnector') }}</p>
            <h3>{{ $t('menu.information') }}</h3>
            <p> {{ $t('chargingStation.connector') }} ID : {{ connectorId }}</p>
            <p> {{ $t('chargingStation.chargerId') }}: {{ ocppId }}</p>

            <div class="form-item">
                <el-select class="select-small" v-model="connectorTypeDefault" :placeholder="$t('general.type')" filterable clearable>
                    <el-option v-for="item in connectorTypeList.data" :label="item.name" :key="item.value" :value="item.value"></el-option>
                </el-select>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" :disabled="connectorTypeDefault===''" @click="updateConnectorType">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_updateConnectorType } from "@/api/api";
import { $CONNECTOR_TYPE_LIST } from "@/utils/global";

export default {
    props: {
        show: Boolean,
        connectorId: Number,
        chargePointId: String,
        connectorType: String,
        ocppId: String
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            connectorTypeDefault: null,
            connectorTypeList: {
                data: $CONNECTOR_TYPE_LIST
            }
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.connectorTypeDefault = this.connectorType;
    },
    methods: {
        updateConnectorType() {
            const that = this;
            let config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            let params = {
                connectorId: that.connectorId,
                chargePointId: that.chargePointId,
                config: config,
                connectorType: that.connectorTypeDefault
            };
            that.isLoading = true;

            $HTTP_updateConnectorType(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.id === that.connectorId) {
                        that.$message({
                            type: "success",
                            message: i18n.t("general.sucUpdateMsg")
                        });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    if (err.status === 500) {
                        that.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                        that.visible = false;
                        that.isLoading = false;
                    }
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
.formVertical {
    min-height: 100px;
    div {
        min-height: 100px;
    }
    p {
        margin-bottom: 5px;
    }
    .connector-type-dropdown {
        height: 40px;
    }
}
</style>
