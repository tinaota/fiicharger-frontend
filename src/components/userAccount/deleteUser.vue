<template>
    <el-dialog :title="$t('general.delete')" width="400px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">

                {{$t('general.deleteThis')}} {{$t('general.user').toLowerCase()}} <b>{{email}}</b>?
            </div>

        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateUsers">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_deleteOperatorPassword } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: {
        email: String,
        id: String,
        show: Boolean,
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
        };
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    this.$Api = $HTTP_deleteOperatorPassword;
                }
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    beforeDestroy() {},
    methods: {
        updateUsers() {
            const that = this;
            let params = {
                id: that.id,
            };

            that.isLoading = true;
            this.$Api(params)
                .then((data) => {
                    that.isLoading = false;
                    if (data.succeeded) {
                        that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({ type: "warning", message: _errors.toString() });
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        },
    },
};
</script>
<style lang = "scss" scoped>
.el-dialog.pwd .el-dialog__body {
    height: 50vh;
}
</style>