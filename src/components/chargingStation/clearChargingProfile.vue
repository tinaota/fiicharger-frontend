<template>
    <el-dialog :title="$t('chargingStation.clearChargingProfile')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{ $t('general.clearThis') }} {{ $t('chargingStation.chargingProfile') }}?</p>
        </div>
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargingProfile') }}</div>
                <el-select class="select-small info" v-model="param.chargingProfileId" filterable v-loading="chargingProfileList.isLoading">
                    <el-option v-for="(item, key) in chargingProfileList.data" :label="item.name" :key="key" :value="item.id"></el-option>
                </el-select>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" v-if="chargingProfileList.total > 0" @click="clearChargingProfile">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getChargingProfilesRecord,
    $HTTP_clearChargingProfile
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
                id: "",
            },
            chargingProfileList: {
                isLoading: false,
                total: 0,
                data: {}
            },
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
                        that.fetchSpecProfileData();
                    });
                }
            }
        },
    },
    methods: {
        fetchSpecProfileData() {
            const params = {
                ChargePointId: this.data.chargePointId,
                IsActive: true
            }
            this.chargingProfileList.isLoading = true;
            $HTTP_getChargingProfilesRecord(params)
                .then((res) => {
                    console.log(res)
                    this.chargingProfileList.isLoading = false;
                    if (res?.data.length > 0) {
                            this.chargingProfileList.data = res.data;
                        this.chargingProfileList.total = res?.data?.length;
                    } else {
                        this.chargingProfileList.data = {};
                        this.chargingProfileList.total = 0;
                    }
                })
                .catch((err) => {
                    this.chargingProfileList.isLoading = false;
                    this.chargingProfileList.data = {};
                    this.chargingProfileList.total = 0;
                    console.log("ChargingProfiles Err", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        clearChargingProfile() {
            if (this.param.chargingProfileId === '') {
                this.$message.error(i18n.t("validation.emptyProfileValidation"));
            } else {
                const that = this;
                let params = {
                    chargePointId: that.data.chargePointId,
                    id: this.param.chargingProfileId,
                };
                console.log(params)
                that.isLoading = true;
                $HTTP_clearChargingProfile(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res === "Accepted") {
                            that.visible = false;
                            this.isUpdate = true;
                            that.$message({
                                type: "success",
                                message: i18n.t("actions.clearChargingProfileAccepted")
                            });
                        } else {
                            that.visible = false;
                            that.isUpdate = false;
                            that.$message({
                                type: "warning",
                                message: i18n.t("actions.clearChargingProfileRejected")
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("clearChargingProfile", err);
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
                id: ""
            };
            this.chargingProfileList.data = {};
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
