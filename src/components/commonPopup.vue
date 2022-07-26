<template>
    <el-dialog :title="$t(`actions.${action}`)" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{ $t(`actions.${action}Question`) }} {{ chargePointId }} ?</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="callApi">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_clearCache, $HTTP_resetChargers } from "@/api/api";

export default {
    props: {
        show: Boolean,
        chargePointId: String,
        action: String
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            params: {
                chargePointId: "",
                type: ""
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
        }
    },
    methods: {
        callApi() {
            this.$API(this.params)
                .then((res) => {
                    if (res === "Accepted") {
                        this.isUpdate = true;
                        this.visible = false;
                        this.$message({
                            type: "success",
                            message: i18n.t(`actions.${this.action}Success`)
                        });
                    }
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
