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
import { $HTTP_clearCache } from "@/api/api";

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
            $API: null
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        if (this.action === "clearCache") {
            this.$API = $HTTP_clearCache;
        }
    },
    methods: {
        callApi() {
            let params = {};
            params.chargePointId = this.chargePointId;
            this.$API(params)
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
