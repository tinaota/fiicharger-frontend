<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{$t('general.modifyChargeBoxPrice')}} {{data.name}}.
                <p class="label">{{ $t('menu.price') }}</p>
                <el-select class="select-small" v-model="priceStatusId" :placeholder="$t('menu.price')" v-loading="priceStatusList.isLoading" filterable clearable>
                    <el-option v-for="(item, idx) in priceStatusList.data" :label="item.name" :key="idx" :value="item.id"></el-option>
                </el-select>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateChargePrice">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_updateChargeBoxPrice, $HTTP_getPriceStatusList, $HTTP_deleteChargeBoxPrice } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: { show: Boolean, data: Object },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            priceStatusList: {
                isLoading: false,
                data: [],
            },
            priceStatusId: "",
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
        if (this.data.chargePrice !== null) {
            this.priceStatusId = this.data.chargePrice.id;
        }
        this.getChargePriceList();
    },
    methods: {
        getChargePriceList() {
            this.priceStatusList.isLoading = true;
            let params = {
                limit: 50,
            };
            $HTTP_getPriceStatusList(params)
                .then((res) => {
                    if (res?.data.length > 0) {
                        this.priceStatusList.isLoading = false;
                        this.priceStatusList.data = res.data.filter((item) => item.status !== "Disabled");
                    } else {
                        this.priceStatusList.data = [];
                        this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                    }
                })
                .catch((err) => {
                    this.priceStatusList.data = [];

                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        updateChargePrice() {
            const that = this;

            that.isLoading = true;
            if (this.priceStatusId !== "") {
                let config = {
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                let params = {
                    chargePointId: that.data.chargeBoxId,
                    data: that.priceStatusId.toString(),
                    config: config,
                };
                $HTTP_updateChargeBoxPrice(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res) {
                            that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                            that.isUpdate = true;
                            that.visible = false;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        that.isLoading = false;
                        that.visible = false;
                        let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                        that.$message({ type: "warning", message: _errors.toString() });
                    });
            } else {
                let params = {
                    chargePointId: that.data.chargeBoxId,
                };
                $HTTP_deleteChargeBoxPrice(params)
                    .then((res) => {
                        if (res.status === 204) {
                            that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                            that.isUpdate = true;
                            that.visible = false;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        that.isLoading = false;
                        that.visible = false;
                        let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                        that.$message({ type: "warning", message: _errors.toString() });
                    });
            }
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        },
    },
};
</script>

<style lang = "scss" scoped>
.formVertical {
    min-height: 80px;
    div {
        min-height: 80px;
    }
}
</style>