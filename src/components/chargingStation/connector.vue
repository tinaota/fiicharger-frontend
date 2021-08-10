<template>
    <div class="connector-obj"
        v-bind:class="{ 'nextLine': isBreak }">
        <el-tooltip :content="$t('chargingStation.connectorList')[dataObj.status]" placement="bottom" effect="light" popper-class="custom">
            <span v-if="dataObj.status===1" class="circle-number color1">{{ dataObj.connectorId }}</span>
            <span v-else-if="dataObj.status===2" class="circle-number color2">{{ dataObj.connectorId }}</span>
            <!-- <span v-else-if="dataObj.status===3" class="circle-number color6">{{ dataObj.connectorId }}</span> -->
            <span v-else-if="dataObj.status===4" class="circle-number color2">{{ dataObj.connectorId }}</span>
            <span v-else-if="dataObj.status===5" class="circle-number color5">{{ dataObj.connectorId }}</span>
            <span v-else-if="dataObj.status===6" class="circle-number color4">{{ dataObj.connectorId }}</span>
            <span v-else-if="dataObj.status===3" class="circular">
                <div class="color6"></div>
                <div class="number">{{ dataObj.connectorId }}</div>
            </span>
        </el-tooltip>
        <span v-if="dataObj.status===0" class="circle-number color0">{{ dataObj.connectorId }}</span>
        <el-tooltip :content="dataObj.connectorType" placement="bottom" effect="light" popper-class="custom">
            <div class="imgItem"><img :src="imgIcon[dataObj.connectorTypeId]"></div>
        </el-tooltip>
    </div>
</template>

<script>
export default {
    props: {
        isBreak: {
            type: Boolean,
            default: false
        },
        dataObj: {
            type: Object,
            default: function() {
                return {
                    connectorId: '',
                    status: 0,
                    connectorTypeId: 3,
                    connectorType: ''
                };
            }
        }
    },
    data() {
        return {
            imgIcon: {
                1: require("imgs/ic_ac_iec.png"),
                2: require("imgs/ic_ac_tesla.png"),
                3: require("imgs/ic_ac_sae.png"),
                4: require("imgs/ic_ac_gbt.png"),
                5: require("imgs/ic_ac_iec.png"),
                6: require("imgs/ic_ac_tesla.png"),
                7: require("imgs/ic_ac_chademo.png"),
                8: require("imgs/ic_ac_ccs2.png"),
                9: require("imgs/ic_ac_ccs1.png"),
                10: require("imgs/ic_ac_gbt.png")
            }
        }
    },
}
</script>