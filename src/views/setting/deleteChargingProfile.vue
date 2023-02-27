<template>
    <el-dialog :title="$t('chargingProfile.delChargingProfile')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{$t('general.deleteThis')}} {{$t('chargingStation.chargingProfile')}} <b>{{data.chargingProfileId}}</b>?</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="delChargingProfile">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_delChargingProfile } from "@/api/api";
import { catchErrors } from "@/utils/function";
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
            }
        }
    },
    beforeDestroy() {},
    methods: {
        delChargingProfile() {
            const that = this;
            let params = {
                chargingProfileId: that.data.id
            };

            that.isLoading = true;
            $HTTP_delChargingProfile(params)
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
                    that.isLoading = false;
                    that.isUpdate = false;
                    that.visible = false;
                    let errorMessage = catchErrors("delete ChargingProfile", err);
                    that.$message({ type: "warning", message: errorMessage });
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
