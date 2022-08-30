<template>
    <el-dialog :title="$t('chargingStation.addChargingProfile')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.chargePointId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.connector') }}</div>
                <el-select class="select-small info" v-model="param.connectorId" v-loading="connectorData.isLoading">
                    <el-option :value="0" :label="'0 ' + $t('general.default')"></el-option>
                    <el-option v-for="item in connectorData.data" :label="item.id + ' ' + item.type" :key="item.id" :value="item.id"></el-option>
                </el-select>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargingProfile') }}</div>
                <el-select class="select-small info" v-model="param.chargingProfileId" filterable>
                    <el-option v-for="item in chargingProfileList.data" :label="item.chargingProfileId" :key="item.chargingProfileId" :value="item.chargingProfileId"></el-option>
                </el-select>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="setChargingProfile">{{ $t('general.perform') }}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getChargingProfiles,
    $HTTP_getConnectorStatusesById,
    $HTTP_setChargingProfile
} from "@/api/api";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            param: {
                chargingProfileId: "",
                connectorId: 0
            },
            chargingProfileList: {
                isLoading: false,
                data: []
            },
            addedProfileData: [],
            connectorData: {
                isLoading: false,
                data: []
            }
        };
    },
    watch: {
        show: {
            handler() {
                const that = this;
                this.visible = this.show;
                if (this.visible) {
                    this.isUpdate = false;
                    this.$nextTick(()=>{
                        that.fetchConnectorStatus(that.data.chargePointId);
                        that.fetchProfileData();
                    });
                }
            }
        },
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
        fetchProfileData() {
            this.chargingProfileList.isLoading = true;
            $HTTP_getChargingProfiles()
                .then((res) => {
                    this.chargingProfileList.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.chargingProfileList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.chargingProfileList.isLoading = false;
                    this.chargingProfileList.data = [];
                    console.log("ChargingProfiles Err", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        setChargingProfile() {
            if (this.param.chargingProfileId === '') {
                this.$message.error(i18n.t("validation.emptyProfileValidation"));
            } else {
                const that = this;
                let params = {
                    chargePointId: that.data.chargePointId,
                    chargingProfileId: parseInt(that.param.chargingProfileId),
                    connectorId: parseInt(that.param.connectorId)
                };
                that.isLoading = true;
                $HTTP_setChargingProfile(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res === "Accepted") {
                            that.visible = false;
                            that.$message({
                                type: "success",
                                message: i18n.t("actions.addChargingProfileAccepted")
                            });
                            that.isUpdate = true;
                        } else {
                            that.visible = false;
                            that.isUpdate = false;
                            that.$message({
                                type: "warning",
                                message: i18n.t("actions.addChargingProfileRejected")
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("setChargingProfile", err)
                        that.visible = false;
                        that.isLoading = false;
                        that.isUpdate = false;
                        let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;

                        that.$message({
                            type: "warning",
                            message: _errors.toString()
                        });
                    });
            }
        },
        closeDialog() {
            this.param = {
                chargingProfileId: "",
                connectorId: 0
            };
            this.$emit("close", this.isUpdate);
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
</style>
