<template>
    <div class="pricingSectionsSub">
        <span class="priceInfo">{{ $t("general.priceInfo") }}</span>
        <div v-for="index in countUsageComponent" :key="index" class="pricingUsageMain">
            <el-collapse class="usageCollapse" v-model="activePricingUsage" accordion>
                <el-collapse-item class="usageCollapseItem" :title="getTitle(pricingUsageData[index-1]?.type, pricingUsageData[index-1]?.reservationType)" :name="`${index}`">
                    <PricingUsage :eachPriceComponent="priceComponents[index-1]" :usageCollapseIndex="index" :totalUsageCollapseIndex="countUsageComponent" :currency="currency" @emitPriceUsageData="getEmittedPriceUsageData" @deletePricingUsageData="deletePricingUsageData"></PricingUsage>
                </el-collapse-item>
            </el-collapse>
        </div>
        <div class="buttonDiv">
            <el-button size="small" type="primary" @click="addPricingUsage">{{ $t('general.addRow') }}</el-button>
        </div>
        <!-- <PricingConditions :restrictions="restrictions" :pricingSectionCollapseIndex="pricingSectionCollapseIndex" @emitPriceConditionsDataFromPriceConditions="getEmittedPriceConditionsData"></PricingConditions> -->
        <!-- only allow to delete the last item -->
        <!-- <div class="actions" v-if="pricingSectionCollapseIndex===totalPricingSectionIndex">
            <i class="fa fa-trash" aria-hidden="true" @click="deletePricingSection"></i>
        </div> -->
        <hr />
    </div>
</template>
<script>
import PricingUsage from "@/components/tariff/pricingUsage.vue";
// import PricingConditions from "@/components/tariff/pricingConditions.vue";
export default {
    components: {
        PricingUsage
        // PricingConditions
    },
    props: {
        pricingSectionCollapseIndex: Number,
        totalPricingSectionIndex: Number,
        eachElement: Object,
        currency: String
    },
    emits: ["deletePricingSectionData", "emitPriceSectionData"],
    data() {
        return {
            countUsageComponent: 1,
            activePricingUsage: "1",
            pricingUsageData: [],
            pricingConditionsData: {},
            // restrictions: {},
            priceComponents: []
        };
    },
    mounted() {
        if (this.eachElement) {
            this.countUsageComponent = this.eachElement.priceComponents.length;
            this.activePricingUsage = `${this.eachElement.priceComponents.length}`;
            // if (Object.keys(this.eachElement?.restrictions).length > 0) {
            //     this.restrictions = this.eachElement.restrictions;
            // }
            if (this.eachElement.priceComponents.length > 0) {
                this.priceComponents = this.eachElement.priceComponents;
            }
        }
    },
    methods: {
        getTitle(type, reservationType) {
            if (type !== undefined && reservationType !== undefined) {
                if (reservationType === null) {
                    return `${i18n.t(
                        `general.${type?.toLowerCase()}PriceUsage`
                    )}`;
                } else if (reservationType === "RESERVATION") {
                    if (type === "TIME") {
                        return `${i18n.t(`general.reservationTimePriceUsage`)}`;
                    } else if (type === "FLAT") {
                        return `${i18n.t(`general.reservationFlatPriceUsage`)}`;
                    }
                } else if (reservationType === "RESERVATION_EXPIRES") {
                    if (type === "TIME") {
                        return `${i18n.t(
                            `general.reservation_expiresTimePriceUsage`
                        )}`;
                    } else if (type === "FLAT") {
                        return `${i18n.t(
                            `general.reservation_expiresFlatPriceUsage`
                        )}`;
                    }
                }
            }
            return;
        },
        updateDataPricingSectionMain() {
            let priceSectionData = {};
            priceSectionData.priceComponents = [...this.pricingUsageData];
            // if (Object.keys(this.pricingConditionsData).length > 0) {
            //     priceSectionData.restrictions = {
            //         ...this.pricingConditionsData
            //     };
            // }
            this.$emit(
                "emitPriceSectionData",
                this.pricingSectionCollapseIndex,
                priceSectionData
            );
        },
        deletePricingSection() {
            this.$emit("deletePricingSectionData");
        },
        getEmittedPriceUsageData(usageCollapseIndex, usageData) {
            // check if item is present in that index
            // subtract one as the countUsageComponent starts at 1
            if (usageCollapseIndex > this.pricingUsageData.length) {
                this.pricingUsageData.push({ ...usageData });
            } else {
                //avoid mutation of array object
                let tempArr = [...this.pricingUsageData];
                tempArr[usageCollapseIndex - 1] = usageData;
                this.pricingUsageData = tempArr;
            }
            this.updateDataPricingSectionMain();
        },
        // getEmittedPriceConditionsData(
        //     pricingSectionCollapseIndex,
        //     priceConditionsData
        // ) {
        //     this.pricingConditionsData = { ...priceConditionsData };
        //     this.updateDataPricingSectionMain();
        // },
        deletePricingUsageData() {
            // only allow deletion if more data is present
            if (this.pricingUsageData.length > 1) {
                this.pricingUsageData.pop();
                this.countUsageComponent -= 1;
                this.activePricingUsage = `${
                    parseInt(this.activePricingUsage) - 1
                }`;
            } else if (this.pricingUsageData.length === 1) {
                this.$message({
                    type: "warning",
                    message: i18n.t("general.tariffUsageWarning")
                });
            }
            this.updateDataPricingSectionMain();
        },
        addPricingUsage() {
            this.countUsageComponent += 1;
            this.activePricingUsage = `${
                parseInt(this.activePricingUsage) + 1
            }`;
        }
    }
};
</script>

<style lang="scss" scoped>
.pricingSectionsSub {
    .priceInfo {
        font-size: 12px;
    }
    .pricingUsageMain {
        display: flex;
        justify-content: center;
        .usageCollapse {
            width: 94%;
            margin-bottom: 5px;
            font-size: 13px;
        }
    }
    .buttonDiv {
        height: 25px;
        .el-button {
            background: #0263ff;
            color: #fff;
            font-size: 14px;
            width: 80px;
            height: 25px;
            border-radius: 6px;
            text-align: center;
            padding: 0;
            float: right;
            margin-right: 5px;
        }
    }
    .actions {
        display: flex;
        justify-content: flex-end;
        color: #0263ff;
    }
    hr {
        border-style: none;
        border-top: 1px solid #606266;
    }
}
</style>
