<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{$t('general.updateThis')}} {{$t('menu.price').toLowerCase()}} {{$t('general.status').toLowerCase()}}?
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateChargePriceStatus">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_updateChargePriceStatus } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: { show: Boolean, data: Object, statusList: Array },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    methods: {
        updateChargePriceStatus() {
            const that = this;
            that.isLoading = true;
            let currentStatus = this.data.status;
            let newStatus = this.statusList.filter((item) => item !== currentStatus);
            let config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            let params = {
                chargePriceId: that.data.id,
                data: newStatus.toString(),
                config: config,
            };

            $HTTP_updateChargePriceStatus(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res === newStatus.toString()) {
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
.formVertical {
    min-height: 50px;
    div {
        min-height: 50px;
    }
}
</style>