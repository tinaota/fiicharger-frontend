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
import ic_ac_iec from 'imgs/ic_ac_iec.png';
import ic_ac_tesla from 'imgs/ic_ac_tesla.png';
import ic_ac_sae from 'imgs/ic_ac_sae.png';
import ic_ac_gbt from 'imgs/ic_ac_gbt.png';
import ic_ac_chademo from 'imgs/ic_ac_chademo.png';
import ic_ac_ccs2 from 'imgs/ic_ac_ccs2.png';
import ic_ac_ccs1 from 'imgs/ic_ac_ccs1.png';
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
                1: ic_ac_iec,
                2: ic_ac_tesla,
                3: ic_ac_sae,
                4: ic_ac_gbt,
                5: ic_ac_iec,
                6: ic_ac_tesla,
                7: ic_ac_chademo,
                8: ic_ac_ccs2,
                9: ic_ac_ccs1,
                10: ic_ac_gbt
            }
        }
    },
}
</script>