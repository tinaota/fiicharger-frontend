<template>
    <el-dialog :title="$t('general.modify')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <p>{{ $t('chargingStation.changeConnector') }}</p>
            <h3>{{ $t('menu.information') }}</h3>
            <p> {{ $t('chargingStation.connector') }} ID : {{ connectorId }}</p>
            <p> {{ $t('chargingStation.chargerId') }}: {{ chargePointId }}</p>

            <div class="form-item">
                <el-select class="select-small" v-model="connectorTypeDefault" :placeholder="$t('general.type')" filterable clearable>
                    <el-option v-for="item in connectorTypeList.data" :label="item.name" :key="item.value" :value="item.value"></el-option>
                </el-select>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" :disabled="connectorTypeDefault===''" @click="updateConnectorType">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_updateConnectorType } from "@/api/api";

export default {
    props: {
        show: Boolean,
        connectorId: Number,
        chargePointId: String,
        connectorType: String
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            connectorTypeDefault: null,
            connectorTypeList: {
                data: [
                    { name: "CHAdeMO, DC", value: "CHADEMO" },
                    { name: "ChaoJi", value: "CHAOJI" },
                    { name: "Type A, NEMA 1-15, 2 pins", value: "DOMESTIC_A" },
                    { name: "Type B, NEMA 5-15, 3 pins", value: "DOMESTIC_B" },
                    { name: "Type C, CEE 7/17, 2 pins", value: "DOMESTIC_C" },
                    { name: "Type D, 3 pins", value: "DOMESTIC_D" },
                    { name: "Type E, CEE 7/5, 3 pins", value: "DOMESTIC_E" },
                    {
                        name: "Type F, CEE 7/4, Schuko, 3 pin)",
                        value: "DOMESTIC_F"
                    },
                    {
                        name: "Type G, BS 1363, Commonwealth, 3 pins",
                        value: "DOMESTIC_G"
                    },
                    { name: "Type H, SI-32, 3 pins", value: "DOMESTIC_H" },
                    { name: "Type I, AS 3112, 3 pins", value: "DOMESTIC_I" },
                    { name: "Type J, SEV 1011, 3 pins", value: "DOMESTIC_J" },
                    {
                        name: "Type K, DS 60884-2-D1, 3 pins",
                        value: "DOMESTIC_K"
                    },
                    {
                        name: "Type L, CEI 23-16-VII, 3 pins",
                        value: "DOMESTIC_L"
                    },
                    { name: "Type M, BS 546, 3 pins", value: "DOMESTIC_M" },
                    { name: "Type N, NBR 14136, 3 pins", value: "DOMESTIC_N" },
                    {
                        name: "Type O, TIS 166-2549, 3 pins",
                        value: "DOMESTIC_O"
                    },
                    { name: "Guobiao GB/T 20234.2 AC", value: "GBT_AC" },
                    { name: "Guobiao GB/T 20234.3 DC", value: "GBT_DC" },
                    {
                        name: "IEC 60309-2 16A single phase",
                        value: "IEC_60309_2_single_16"
                    },
                    {
                        name: "IEC 60309-2 16A three phase",
                        value: "IEC_60309_2_three_16"
                    },
                    {
                        name: "IEC 60309-2 32A three phase",
                        value: "IEC_60309_2_three_32"
                    },
                    {
                        name: "IEC 60309-2 64A three phase",
                        value: "IEC_60309_2_three_64"
                    },
                    { name: "Type 1, SAE J1772)", value: "IEC_62196_T1" },
                    { name: "Type 1 combo, DC", value: "IEC_62196_T1_COMBO" },
                    { name: "Type 2, Mennekes", value: "IEC_62196_T2" },
                    { name: "Type 2 combo, DC", value: "IEC_62196_T2_COMBO" },
                    { name: "Type 3A", value: "IEC_62196_T3A" },
                    { name: "Type 3C, Scame", value: "IEC_62196_T3C" },
                    { name: "NEMA 5-20, 3 pins", value: "NEMA_5_20" },
                    { name: "NEMA 6-30, 3 pins", value: "NEMA_6_30" },
                    { name: "NEMA 6-50, 3 pins", value: "NEMA_6_50" },
                    { name: "NEMA 10-30, 3 pins", value: "NEMA_10_30" },
                    { name: "NEMA 10-50, 3 pins", value: "NEMA_10_50" },
                    { name: "NEMA 14-30, 3 pins", value: "NEMA_14_30" },
                    { name: "NEMA 14-50, 3 pins", value: "NEMA_14_50" },
                    {
                        name: "On-board bottom-up pantograph",
                        value: "PANTOGRAPH_BOTTOM_UP"
                    },
                    {
                        name: "Off-board top-down pantograph",
                        value: "PANTOGRAPH_TOP_DOWN"
                    },
                    {
                        name: "Tesla Roadster-type, round, 4 pins",
                        value: "TESLA_R"
                    },
                    {
                        name: "Tesla Model-S-type, oval, 5 pins",
                        value: "TESLA_S"
                    }
                ]
            }
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.connectorTypeDefault = this.connectorType;
    },
    methods: {
        updateConnectorType() {
            const that = this;
            let config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            let params = {
                connectorId: that.connectorId,
                chargePointId: that.chargePointId,
                config: config,
                connectorType: that.connectorTypeDefault
            };
            that.isLoading = true;

            $HTTP_updateConnectorType(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.id === that.connectorId) {
                        that.$message({
                            type: "success",
                            message: i18n.t("general.sucUpdateMsg")
                        });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    if (err.status === 500) {
                        that.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                        that.visible = false;
                        that.isLoading = false;
                    }
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
    min-height: 100px;
    div {
        min-height: 100px;
    }
    p {
        margin-bottom: 5px;
    }
    .connector-type-dropdown {
        height: 40px;
    }
}
</style>
