<template>
    <div class="startTransactionPopUp">
        <div class="item">
            <div class="label">{{ $t('menu.idTag') }}</div>
            <div class="info">
                <CommonList placeHolder="menu.idTag" selectedLabel="id" listType="idTag" @updateData="getIdTag"></CommonList>
            </div>
        </div>
        <div class="item">
            <div class="label">{{ $t('chargingStation.chargingProfile') }}</div>
            <div class="info">
                <CommonList placeHolder="chargingStation.chargingProfile" selectedLabel="name" listType="chargingProfile" @updateData="getChargingProfile"></CommonList>
            </div>
        </div>
        <div class="item">
            <div class="label">{{ $t('chargingProfile.stackLevel') }}</div>
            <div class="info">
                <el-input-number style="width:100%" v-model="stackLevel" :step="1" :min="0" @change="updateStackLevel"></el-input-number>
            </div>
        </div>
    </div>
</template>
<script>
import CommonList from "@/components/commonList.vue";
export default {
    components: {
        CommonList
    },
    data() {
        return {
            idTag: null,
            templateId: null,
            stackLevel: null
        };
    },
    methods: {
        getIdTag(idTag) {
            // set id tag as a parameter directly
            this.idTag = idTag;
            this.emitUpdatedValue();
        },
        getChargingProfile(templateId) {
            this.templateId = templateId;
            this.emitUpdatedValue();
        },
        updateStackLevel(stackLevel) {
            this.stackLevel = stackLevel;
            this.emitUpdatedValue();
        },
        emitUpdatedValue() {
            let combinedParams = {};
            combinedParams = {
                stackLevel: this.stackLevel,
                templateId: this.templateId,
                idTag: this.idTag
            };
            this.$emit("update", combinedParams);
        }
    }
};
</script>

<style lang = "scss" scoped>
.startTransactionPopUp {
    height: auto;
    .item {
        display: flex;
        width: 100%;
        height: 40px;
        justify-content: space-between;
        margin-top: 5px;
        .info{
            width: 180px;
        }
    }
}
</style>
