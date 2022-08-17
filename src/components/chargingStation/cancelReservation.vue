<template>
    <el-dialog :title="$t('chargingStation.cancelReservation')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{ $t("actions.cancelReservation") }}</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="cancelReservation">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_cancelReservation } from "@/api/api";
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
        cancelReservation() {
            const that = this;
            let params = {
                chargePointId: that.data.chargePointId,
                connectorId: that.data.connectorId ?? 0
            };
            if (that.data.reservationId) {
                params.reservationId = that.data.reservationId;
            }
            that.isLoading = true;
            $HTTP_cancelReservation(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res === "Accepted") {
                        this.$message({
                            type: "success",
                            message: i18n.t("actions.cancelReservationAccepted")
                        });
                    } else if (res === "Rejected") {
                        this.$message({
                            type: "success",
                            message: i18n.t("actions.cancelReservationRejected")
                        });
                    } else if (res === "NoAction") {
                        this.$message({
                            type: "success",
                            message: i18n.t("actions.cancelReservationNoAction")
                        });
                    }
                    that.isUpdate = true;
                    that.visible = false;
                })
                .catch((err) => {
                    console.log("cancelReservation", err);
                    that.isLoading = false;
                    that.isUpdate = false;
                    that.visible = false;
                    that.$message({
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
