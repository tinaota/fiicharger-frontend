<template>
    <div class="pricingSectionsMain">
        <!-- {{ pricingSectionData }}
        {{ pricingSectionData.length }} -->
        <div v-for="index in pricingSectionCount" :key="index">
            <el-collapse class="pricingSectionCollapse" v-model="activePricingSection" accordion>
                <el-collapse-item class="pricingSectionCollapseItem" :title="$t('general.pricingSections')" :name="`${index}`">
                    <PricingSectionsSub :pricingSectionCollapseIndex="index" :totalPricingSectionIndex="pricingSectionCount" @deletePricingSectionData="deletePricingSectionData" @emitPriceSectionData="getEmittedPriceSectionData"></PricingSectionsSub>
                </el-collapse-item>
            </el-collapse>
        </div>
        <el-button size="small" type="primary" @click="addPricingSections">{{ $t('general.addRow') }}</el-button>
    </div>
</template>

<script>
import PricingSectionsSub from "@/components/tariff/pricingSectionsSub.vue";
export default {
    components: {
        PricingSectionsSub
    },
    emits: ["emitPricingSectionDataFromMain"],
    data() {
        return {
            pricingSectionCount: 1,
            activePricingSection: "1",
            pricingSectionData: []
        };
    },
    methods: {
        getEmittedPriceSectionData(priceSectionIndex, priceSectionData) {
            // check if item is present in that index
            // subtract one as the pricingSectionCount starts at 1
            if (priceSectionIndex > this.pricingSectionData.length) {
                this.pricingSectionData.push({ ...priceSectionData });
            } else {
                //    avoid mutation of array object
                let tempArr = [...this.pricingSectionData];
                tempArr[priceSectionIndex - 1] = priceSectionData;
                this.pricingSectionData = tempArr;
            }
            this.$emit(
                "emitPricingSectionDataFromMain",
                this.pricingSectionData
            );
        },
        deletePricingSectionData() {
            // only allow deletion if more data is present
            if (this.pricingSectionData.length > 1) {
                this.pricingSectionData.pop();
                // } else if (this.pricingSectionData.length === 1) {
            } else {
                this.$message({
                    type: "warning",
                    message: i18n.t("general.pricingSectionWarning")
                });
            }
        },
        addPricingSections() {
            console.log("add pricing sections");
            this.pricingSectionCount += 1;
            this.activePricingSection = `${
                parseInt(this.activePricingSection) + 1
            }`;
        }
    }
};
</script>
<style lang="scss" scoped>
.pricingSectionsMain {
    .mCSB_inside > .mCSB_container {
        margin-right: 8px;
    }
    .pricingSectionCollapse {
        width: 100%;
        margin-bottom: 5px;
    }
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
</style>
