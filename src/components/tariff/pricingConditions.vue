<template>
    <div class="pricingConditions">
        <h3>{{ $t('general.pricingConditions') }}</h3>
        <span class="pricingConditionsInfo">{{ $t("general.pricingConditionsInfo") }}</span>
        <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('general.all')" name="all">
                <div v-if="activeTab==='all'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('general.time')" name="time">
                <div v-if="activeTab==='time'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('general.kWh')" name="kWh">
                <div v-if="activeTab==='kWh'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('general.current')" name="current">
                <div v-if="activeTab==='current'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('chargingStation.power')" name="power">
                <div v-if="activeTab==='power'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('chargingStation.reservation')" name="reservation">
                <div v-if="activeTab==='reservation'">
                    <PricingConditionsFilter :restrictions="restrictions" :tabSelected="activeTab" @emitPriceConditionsDataFromFilter="getPricingConditionsData"></PricingConditionsFilter>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import PricingConditionsFilter from "@/components/tariff/pricingConditionsFilter.vue";
export default {
    components: {
        PricingConditionsFilter
    },
    props: {
        pricingSectionCollapseIndex: Number,
        restrictions: Object
    },
    emits: ["emitPriceConditionsDataFromPriceConditions"],
    data() {
        return {
            activeTab: "all"
        };
    },
    methods: {
        getPricingConditionsData(pricingConditionsData) {
            this.$emit(
                "emitPriceConditionsDataFromPriceConditions",
                this.pricingSectionCollapseIndex,
                pricingConditionsData
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.pricingConditions {
    h3 {
        margin-block-start: 0;
        margin-block-end: 0;
    }
    .pricingConditionsInfo {
        font-size: 10px;
    }
}
</style>
