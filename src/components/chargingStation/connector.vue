<template>
    <div class="connector-obj" v-bind:class="{ 'nextLine': isBreak }">
        <el-tooltip :content="chargePointStatus===`Disconnected` ? 'Unknown' :dataObj.status" placement="bottom" effect="light" popper-class="custom">
            <span v-if="chargePointStatus===`Disconnected`" class="imgItemUnknown imgItem">
                <img :src="imgIcon.Unknown">
            </span>
            <span v-else-if="dataObj.status===`Available`" class="circle-number color1">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`Preparing`" class="circle-number color2">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`SuspendedEVSE`" class="circle-number color6">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`SuspendedEV`" class="circle-number color6">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`Finishing`" class="circle-number color2">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`Reserved`" class="circle-number color5">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`Unavailable`" class="circle-number color4">{{ dataObj.id }}</span>
            <span v-if="dataObj.status===`Faulted`" class="circle-number color0">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===`Charging`" class="circular">
                <div class="color6"></div>
                <div class="number">{{ dataObj.id }}</div>
            </span>
        </el-tooltip>
        <!-- <span v-if="dataObj.status===`ConnectionLost`" class="circle-number color0">{{ dataObj.id }}</span> -->
        <el-tooltip v-if="connectorType" :content="dataObj.type" placement="bottom" effect="light" popper-class="custom">
            <div class="imgItem" v-if="dataObj.type!==`Unknown`"><img :src="connectorType ==='AC'? imgIcon[`${dataObj.type}_AC`] : imgIcon[`${dataObj.type}_DC`]"></div>
            <div v-if="dataObj.type===`Unknown`" class="imgItemUnknown imgItem">
                <img :src="imgIcon.Unknown">
            </div>
        </el-tooltip>
    </div>
</template>

<script>
import ic_ac_iec from "imgs/ic_ac_iec.png";
import ic_ac_tesla from "imgs/ic_ac_tesla.png";
import ic_ac_sae from "imgs/ic_ac_sae.png";
import ic_ac_gbt from "imgs/ic_ac_gbt.png";
import ic_dc_iec from "imgs/ic_dc_iec.png";
import ic_dc_tesla from "imgs/ic_dc_tesla.png";
import ic_dc_chademo from "imgs/ic_dc_chademo.png";
import ic_dc_ccs2 from "imgs/ic_dc_ccs2.png";
import ic_dc_ccs1 from "imgs/ic_dc_ccs1.png";
import ic_dc_gbt from "imgs/ic_dc_gbt.png";
import unknown from "imgs/help_icon.svg";
export default {
    props: {
        isBreak: {
            type: Boolean,
            default: false,
        },
        dataObj: {
            type: Object,
            default: function () {
                return {
                    connectorId: "",
                    status: 0,
                };
            },
        },
        connectorType: "",
        chargePointStatus: "",
    },
    data() {
        return {
            imgIcon: {
                Type2_AC: ic_ac_iec,
                Tesla_AC: ic_ac_tesla,
                Type1_AC: ic_ac_sae,
                J1772_AC: ic_ac_sae,
                GBT_AC: ic_ac_gbt,
                Type2_DC: ic_dc_iec,
                Tesla_DC: ic_dc_tesla,
                CHADeMO_DC: ic_dc_chademo,
                CCS2_DC: ic_dc_ccs2,
                CCS1_DC: ic_dc_ccs1,
                GBT_DC: ic_dc_gbt,
                Unknown: unknown,
            },
        };
    },
};
</script>

<style scoped>
.imgItem {
    margin-top: 2px;
}
.imgItemUnknown {
    width: 28px;
}
.imgItemUnknown img {
    height: 28px;
    width: 28px;
}
</style>