<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                Are you sure you want to delete this ChargePrice?
                <h3>Info</h3>
                <p>Name: {{data.name}}</p>
                <p>ChargeRate(On-Peak):{{getSymbols(data.currencyType)}} {{getSymbols(data.onPeak.rate)}} / {{getSymbols(data.onPeak.type)}}</p>
                <p>ChargeRate(Off-Peak):{{getSymbols(data.currencyType)}} {{getSymbols(data.offPeak.rate)}} / {{getSymbols(data.offPeak.type)}}</p>
                <p>Occupancy Rate: {{getSymbols(data.currencyType) + getSymbols(data.occupancyRate) + '/' + data.occupancyPeriodMinutes + 'min'}}</p>

                <p>Status: {{data.status}}</p>

            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="deleteChargePrice">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_deleteChargePrice } from "@/api/api";
import { setScrollBar, transformToSymbols } from "@/utils/function";
export default {
    props: { show: Boolean, data: Object },
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
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    methods: {
        deleteChargePrice() {
            const that = this;
            let params = {
                chargePriceId: that.data.id,
            };
            that.isLoading = true;

            $HTTP_deleteChargePrice(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.status === 204) {
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
    min-height: 200px;
    div {
        min-height: 200px;
    }
}
</style>