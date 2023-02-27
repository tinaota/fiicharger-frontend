<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            {{ $t('general.modifyChargeBoxPrice') }} {{ data.name }}.
            <div class="item">
                <p class="label">{{ $t('menu.tariff') }}</p>
                <el-select class="autoresizeselect" v-model="tariffId" :placeholder="$t('menu.tariff')" v-loading="tariffList.isLoading" multiple filterable clearable>
                    <el-option v-for="(item, idx) in tariffList.data" :label="item.name" :key="idx" :value="item.id"></el-option>
                </el-select>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateTariff">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_getChargeBoxTariff, $HTTP_updateChargeBoxTariff, $HTTP_getTarrifs, $HTTP_deleteChargeBoxTariff } from "@/api/api";
import { $ALL_DATA_COUNT } from "@/utils/global";
import { catchErrors } from "@/utils/function";
export default {
    props: { show: Boolean, data: Object },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            tariffList: {
                isLoading: false,
                data: []
            },
            tariffId: [],
            originalSelectedTariffId: []
        };
    },
    beforeMount() {
        this.getSpecificTariff();
    },
    computed: {
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        this.getTariffList();
    },
    methods: {
        getSpecificTariff() {
            let params = {
                chargePointId: this.data.chargeBoxId
            };
            $HTTP_getChargeBoxTariff(params).then((res) => {
                if (res && res.length > 0) {
                    let tariffList = res.map((item) => item.id);
                    this.originalSelectedTariffId = tariffList;
                    this.tariffId = tariffList;
                } else {
                    this.originalSelectedTariffId = [];
                    this.tariffId = [];
                }
            });
        },
        getTariffList() {
            this.tariffList.isLoading = true;
            let params = {
                limit: $ALL_DATA_COUNT,
                IsDeprecated: false
            };
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            $HTTP_getTarrifs(params)
                .then((res) => {
                    if (res?.data.length > 0) {
                        this.tariffList.isLoading = false;
                        this.tariffList.data = res.data;
                    } else {
                        this.tariffList.data = [];
                        this.tariffList.isLoading = false;
                        this.$message({
                            type: "warning",
                            message: i18n.t("emptyMessage")
                        });
                    }
                })
                .catch((err) => {
                    this.tariffList.data = [];
                    let errorMessage = catchErrors("get tariffs", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        deleteTariff(deletedTariffId, params, newAddedTariffId) {
            const that = this;
            deletedTariffId.map((item) => {
                params.tariffId = item;
                $HTTP_deleteChargeBoxTariff(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res) {
                            that.$message({
                                type: "success",
                                message: i18n.t("general.sucUpdateMsg")
                            });
                            that.isUpdate = true;
                            that.visible = false;
                            this.addTariff(newAddedTariffId, params);
                        }
                    })
                    .catch((err) => {
                        that.isLoading = false;
                        that.visible = false;
                        deleteTariff = false;
                        let errorMessage = catchErrors("modify chargebox tariff", err);
                        that.$message({ type: "warning", message: errorMessage });
                    });
            });
        },
        addTariff(newAddedTariffId, params) {
            const that = this;
            newAddedTariffId.map((item) => {
                params.tariffId = item;
                $HTTP_updateChargeBoxTariff(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res) {
                            that.$message({
                                type: "success",
                                message: i18n.t("general.sucUpdateMsg")
                            });
                            that.isUpdate = true;
                            that.visible = false;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        this.isLoading = false;
                        that.visible = false;
                        if (err.status === 409) {
                            that.$message({
                                type: "warning",
                                message: i18n.t("general.typeConflict", {
                                    item: this.data.ocppId
                                })
                            });
                        }
                    });
            });
        },
        updateTariff() {
            const that = this;
            that.isLoading = true;

            let newAddedTariffId = this.tariffId.filter((item) => this.originalSelectedTariffId.indexOf(item) === -1);

            let deletedTariffId = this.originalSelectedTariffId.filter((item) => this.tariffId.indexOf(item) === -1);
            let params = {
                chargePointId: that.data.chargeBoxId
            };
            let deleteTariffCheck = false;
            if (deletedTariffId.length > 0) {
                deleteTariffCheck = true;
                this.deleteTariff(deletedTariffId, params, newAddedTariffId);
            }

            if (newAddedTariffId.length > 0 && !deleteTariffCheck) {
                this.addTariff(newAddedTariffId, params);
            }

            // do not update anything if nth is changed
            if (newAddedTariffId.length === 0 && deletedTariffId.length === 0) {
                that.isLoading = false;
                that.visible = false;
                that.$message({
                    type: "warning",
                    message: i18n.t("general.tariffNotUpdated", {
                        item: this.data.ocppId
                    })
                });
            }
        },
        closeDialog() {
            this.tariffList = {
                isLoading: false,
                data: []
            };
            this.tariffId = [];
            this.originalSelectedTariffId = [];
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
.formVertical {
    div {
        .item {
            display: flex;
            flex-direction: column;
            margin-right: 15px;
        }
    }
}
</style>
