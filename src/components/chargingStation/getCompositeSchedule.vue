<template>
    <el-dialog :title="$t('chargingStation.getCompositeSchedule')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.ocppId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.connector') }}</div>
                <el-select class="select-small info" v-model="param.connectorId" v-loading="connectorData.isLoading">
                    <el-option :value="0" :label="'0 ' + $t('general.default')"></el-option>
                    <el-option v-for="item in connectorData.data" :label="item.id + ' ' + item.type" :key="item.id" :value="item.id"></el-option>
                </el-select>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingProfile.scheduleDuration') }}</div>
                <div class="info">
                    <el-input-number style="width:100%" v-model="param.duration" :step="10" :min="0" controls-position="right"></el-input-number>
                </div>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="getCompositeSchedule()">{{ $t('general.perform') }}</el-button>
        </p>
        <ShowCompositeSchedule v-show="showCompositeScheduleDialog.visible" :show="showCompositeScheduleDialog.visible" :data="showCompositeScheduleDialog.data" @close="changeShowCompositeScheduleStatus"></ShowCompositeSchedule>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getCompositeSchedule,
    $HTTP_getConnectorStatusesById
} from "@/api/api";
import ShowCompositeSchedule from "@/components/chargingStation/showCompositeSchedule";
export default {
    components: {
        ShowCompositeSchedule
    },
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            param: {
                duration: 86400,
                connectorId: 0
            },
            showCompositeScheduleDialog: {
                visible: false,
                data: {}
            },
            connectorData: {
                isLoading: false,
                data: []
            }
        };
    },
    watch: {
        show: {
            handler() {
                this.visible = this.show;
                if (this.visible) {
                    this.$nextTick(() => {
                        this.fetchConnectorStatus(this.data.chargePointId);
                    });
                }
            }
        }
    },
    methods: {
        fetchConnectorStatus(id) {
            let params = {
                chargePointId: id
            };
            this.connectorData.isLoading = true;
            $HTTP_getConnectorStatusesById(params)
                .then((res) => {
                    this.connectorData.isLoading = false;
                    if (res.length > 0) {
                        this.connectorData.data = res;
                    } else {
                        this.connectorData.data = [];
                    }
                })
                .catch((err) => {
                    this.connectorData.isLoading = false;
                    this.connectorData.data = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getCompositeSchedule() {
            const that = this;
            let params = {
                chargePointId: that.data.chargePointId,
                connectorId: that.param.connectorId,
                duration: 0
            };
            if (this.param.duration) {
                params.duration = this.param.duration;
            }
            that.isLoading = true;
            that.showCompositeScheduleDialog.data = {};
            $HTTP_getCompositeSchedule(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.status === "Accepted") {
                        that.visible = true;
                        that.showCompositeScheduleDialog.data = { ...res };
                        that.showCompositeScheduleDialog.data.name =
                            that.data.name;
                        that.showCompositeScheduleDialog.data.chargePointId =
                            that.data.chargePointId;
                        that.showCompositeScheduleDialog.data.ocppId =
                            that.data.ocppId;
                        that.showCompositeScheduleDialog.visible = true;
                    } else {
                        that.visible = false;
                        that.$message({
                            type: "warning",
                            message: i18n.t(
                                "actions.getCompositeScheduleFaulted"
                            )
                        });
                    }
                })
                .catch((err) => {
                    console.log("getCompositeSchedule", err);
                    that.visible = false;
                    that.isLoading = false;
                    let _errors = err?.data?.errors
                        ? Object.values(err?.data?.errors)
                        : err?.data;

                    that.$message({
                        type: "warning",
                        message: _errors.toString()
                    });
                });
        },
        closeDialog() {
            this.param = {
                duration: 86400,
                connectorId: 0
            };
            this.$emit("close");
        },
        changeShowCompositeScheduleStatus() {
            this.showCompositeScheduleDialog.visible = false;
            this.showCompositeScheduleDialog.data={}
        }
    }
};
</script>

<style lang = "scss" scoped>
.el-button {
    background: #0263ff;
    color: #fff;
    border: unset;
    font-size: 1rem;
    width: 130px;
    height: 50px;
    border-radius: 6px;
    text-align: center;
}

.dialogForm {
    .item {
        display: flex;
        width: 100%;
        height: auto;
        justify-content: space-between;
        margin-top: 12px;
        .info {
            width: 180px;
            word-break: break-all;
        }
    }
}
</style>
