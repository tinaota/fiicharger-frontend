<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            {{ $t('general.modifyChargeBoxPrice') }} {{ data.name }}.
            <div class="item">
                <p class="label">{{ $t('menu.tariff') }}</p>
                <el-select class="autoresizeselect" v-model="tariffId" :placeholder="$t('menu.tariff')" v-loading="tariffList.isLoading" multiple filterable clearable>
                    <el-option v-for="(item, idx) in tariffList.data" :label="item.name" :key="idx" :value="item.guid"></el-option>
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
import {
    $HTTP_getChargeBoxTariff,
    $HTTP_updateChargeBoxTariff,
    $HTTP_getTarrifs,
    $HTTP_deleteChargeBoxTariff
} from "@/api/api";
import { $ALL_DATA_COUNT } from "@/utils/global";
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
                    let tariffList = res.map((item) => item.guid);
                    this.originalSelectedTariffId = tariffList;
                    this.tariffId = tariffList;
                } else {
                    this.originalSelectedTariffId = [];
                }
            });
        },
        getTariffList() {
            this.tariffList.isLoading = true;
            let params = {
                limit: $ALL_DATA_COUNT,
                IsDeprecated: false
            };
            $HTTP_getTarrifs(params)
                .then((res) => {
                    if (res?.data.length > 0) {
                        this.tariffList.isLoading = false;
                        this.tariffList.data = res.data;
                    } else {
                        this.tariffList.data = [];
                        this.$message({
                            type: "warning",
                            message: i18n.t("emptyMessage")
                        });
                    }
                })
                .catch((err) => {
                    this.tariffList.data = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        updateTariff() {
            const that = this;
            that.isLoading = true;

            let newAddedTariffId = this.tariffId.filter(
                (item) => this.originalSelectedTariffId.indexOf(item) === -1
            );

            let deletedTariffId = this.originalSelectedTariffId.filter(
                (item) => this.tariffId.indexOf(item) === -1
            );
            let params = {
                chargePointId: that.data.chargeBoxId
            };

            newAddedTariffId.length > 0 &&
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
                            that.isLoading = false;
                            that.visible = false;
                            if (err.status === 409) {
                                that.$message({
                                    type: "warning",
                                    message: i18n.t("general.typeConflict", {
                                        item: this.data.chargeBoxId
                                    })
                                });
                            }
                        });
                });

            deletedTariffId.length > 0 &&
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
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            that.isLoading = false;
                            that.visible = false;
                            let _errors = err?.data?.errors
                                ? Object.values(err?.data?.errors)
                                : err?.data;
                            that.$message({
                                type: "warning",
                                message: _errors.toString()
                            });
                        });
                });
            // do not update anything if nth is changed
            if (newAddedTariffId.length === 0 && deletedTariffId.length === 0) {
                that.isLoading = false;
                that.visible = false;
                that.$message({
                    type: "warning",
                    message: i18n.t("general.tariffNotUpdated", {
                        item: this.data.chargeBoxId
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