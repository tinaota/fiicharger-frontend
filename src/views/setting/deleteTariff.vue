<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{ $t('general.deleteThis') }} {{ $t('menu.tariff').toLowerCase() }}?
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="deleteTariff">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_deleteTarrifsById } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: { show: Boolean, data: Object },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false
        };
    },

    mounted() {
        const that = this;
        that.visible = that.show;
        that.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    methods: {
        deleteTariff() {
            const that = this;
            let params = {
                guid: that.data.guid
            };
            that.isLoading = true;

            $HTTP_deleteTarrifsById(params)
                .then((res) => {
                    that.isLoading = false;
                    console.log(res);
                    if (res.status === 204) {
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
                            message: i18n.t("cannotDelete")
                        });
                        that.visible = false;
                        that.isLoading = false;
                    } else if (err.status === 404) {
                        that.$message({
                            type: "warning",
                            message: i18n.t("general.tariffNotFound", {
                                item: that.data.guid
                            })
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
    min-height: 50px;
    div {
        min-height: 50px;
    }
}
</style>
