<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{$t('general.deleteThis')}} {{$t('menu.price').toLowerCase()}}?
                <h3>{{$t('menu.information')}}</h3>
                <p>{{$t('general.name')}}: {{data.name}}</p>
                <p>{{$t('chargingStation.elecRate')}}({{$t('chargingStation.onPeak')}}): {{getSymbols(data.currencyType) + getSymbols(data.onPeak.rate) +'/'+ getSymbols(data.onPeak.type)}}</p>
                <p>{{$t('chargingStation.elecRate')}}({{$t('chargingStation.offPeak')}}): {{getSymbols(data.currencyType) + getSymbols(data.offPeak.rate) +  '/' + getSymbols(data.offPeak.type)}}</p>
                <p>{{$t('chargingStation.parkingRate')}}: {{getSymbols(data.currencyType) + getSymbols(data.occupancy.rate) + '/' + getSymbols(data.occupancy.type)}}</p>
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
                    if (err.status === 500) {
                        that.$message({ type: "warning", message: i18n.t("cannotDelete") });
                        that.visible = false;
                        that.isLoading=false
                    }
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
    min-height: 220px;
    div {
        min-height: 220px;
    }
}
</style>