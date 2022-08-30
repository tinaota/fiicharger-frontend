<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="inner" :show-close="false" v-loading="isLoading" @close="closeDialog()" append-to-body>
        <div class="formVertical">
            <p>{{$t('general.deleteThis')}} <b>{{ data.id ? data.id : '' }}</b>?</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="handleDel">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_delChargingProfilePeriods } from "@/api/api";
export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false
        };
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
            },
        },
    },
    beforeDestroy() {},
    methods: {
        handleDel() {
            if (this.data.isCreate) {
                this.isUpdate = true;
                this.visible = false;
            } else {
                this.delPeriod();
            }
        },
        delPeriod() {
            const that = this;
            let params = {
                chargingSchedulePeriodId : that.data.id,
            };

            that.isLoading = true;
            $HTTP_delChargingProfilePeriods(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res?.status === 204) {
                        that.$message({
                            type: "success",
                            message: i18n.t("general.sucDelMsg")
                        });
                        that.isUpdate = true;
                    } else {
                        this.$message({
                            type: "warning",
                            message: err?.data
                        });
                        that.isUpdate = false;
                    }
                    that.visible = false;
                })
                .catch((err) => {
                    console.log("delete ProfilePeriods", err);
                    that.isLoading = false;
                    that.isUpdate = false;
                    that.visible = false;
                    that.$message({
                        type: "warning",
                        message: err?.data
                    });
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate, this.isCreate ? this.data.id : null);
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
    p {
        margin-bottom: 5px;
    }
}
</style>