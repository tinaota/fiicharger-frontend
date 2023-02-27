<template>
    <el-dialog :title="$t('general.setConfiguration')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" @close="closeDialog()">
        <div class="item">
            <div class="label">{{ selectedKey }}</div>
            <div class="info">
                <el-input style="width:100%" v-model="value"></el-input>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateConfiguration" :disabled="!value">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_updateConfiguration } from "@/api/api";
import { catchErrors } from "@/utils/function";
export default {
    props: {
        show: Boolean,
        chargePointId: String,
        selectedKey: String
    },
    data() {
        return {
            visible: false,
            value: null
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
    },
    methods: {
        updateConfiguration() {
            let params = {};
            params = {
                chargePointId: this.chargePointId,
                key: this.selectedKey,
                value: this.value
            };

            $HTTP_updateConfiguration(params)
                .then((res) => {
                    if (res === "Accepted") {
                        this.$message({
                            type: "success",
                            message: i18n.t("actions.configurationAccepted")
                        });
                    } else if (res === "NotSupported") {
                        this.$message({
                            type: "warning",
                            message: i18n.t("actions.configurationNotSupported")
                        });
                    }
                    this.visible = false;
                })
                .catch((err) => {
                    console.log(err);
                    this.visible = false;
                    let errorMessage = catchErrors("set configurations", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        closeDialog() {
            this.value = null;
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang="scss" scoped>
.item {
    display: flex;
    width: 100%;
    height: 40px;
    justify-content: space-between;
    margin-top: 5px;
    align-items: center;
    word-break: break-all;
    .label {
        margin-right: 5px;
    }
}
</style>
