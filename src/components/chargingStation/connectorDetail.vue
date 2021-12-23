<template>
    <div class="connector-obj detail">
        <div class="header">
            <el-tooltip :content="$t('chargingStation.connectorList')[data.connectorInfo.status]" placement="bottom" effect="light" popper-class="custom">
                <span v-if="data.connectorInfo.status===1" class="circle-number color1">{{ data.connectorInfo.connectorId }}</span>
                <span v-else-if="data.connectorInfo.status===2" class="circle-number color2">{{ data.connectorInfo.connectorId }}</span>
                <!-- <span v-else-if="data.connectorInfo.status===3" class="circle-number color6">{{ data.connectorInfo.connectorId }}</span> -->
                <span v-else-if="data.connectorInfo.status===4" class="circle-number color2">{{ data.connectorInfo.connectorId }}</span>
                <span v-else-if="data.connectorInfo.status===5" class="circle-number color5">{{ data.connectorInfo.connectorId }}</span>
                <span v-else-if="data.connectorInfo.status===6" class="circle-number color4">{{ data.connectorInfo.connectorId }}</span>
                <span v-else-if="data.connectorInfo.status===3" class="circular">
                    <div class="color6"></div>
                    <div class="number">{{ data.connectorInfo.connectorId }}</div>
                </span>
            </el-tooltip>
            <span v-if="data.connectorInfo.status===0" class="circle-number color0">{{ data.connectorInfo.connectorId }}</span>
            <div class="imgItem"><img :src="imgIcon[data.connectorInfo.connectorTypeId]"></div>
            <div class="name" :class="{'circular': data.connectorInfo.status===3}">{{ data.connectorInfo.connectorType }}</div>
            <div class="battery">{{ $t('cars.battery') + ' ' + data.battery + '%' }}</div>
        </div>
        <div class="info">
            <div class="loadBalance">{{ $t('chargingStation.loadBalance') + ' ' + data.chartInfo.loadBalancePowerLimit + 'kw' }}</div>
        </div>
        <el-slider
            :class="{'spec': data.vipStatus}"
            v-model="data.chartInfo.intervalMaxPower"
            :min="0"
            :max="data.chartInfo.connectorDefaultMaxPower"
            :step="1"
            :marks="getSliderMarks(0, data.chartInfo.connectorDefaultMaxPower, data.chartInfo.powerGap, 'kw')"
            disabled>
        </el-slider>
    </div>
</template>

<script>
import ic_ac_iec from 'imgs/ic_ac_iec.png';
import ic_ac_tesla from 'imgs/ic_ac_tesla.png';
import ic_ac_sae from 'imgs/ic_ac_sae.png';
import ic_ac_gbt from 'imgs/ic_ac_gbt.png';
import ic_dc_iec from 'imgs/ic_dc_iec.png';
import ic_dc_tesla from 'imgs/ic_dc_tesla.png';
import ic_dc_chademo from 'imgs/ic_dc_chademo.png';
import ic_dc_ccs2 from 'imgs/ic_dc_ccs2.png';
import ic_dc_ccs1 from 'imgs/ic_dc_ccs1.png';
import ic_dc_gbt from 'imgs/ic_dc_gbt.png';
export default {
    props: {
        data: {
            type: Object,
            default: function() {
                return {
                    connectorInfo: {
                        connectorId: 1,
                        connectorType: 'Type 1',
                        connectorTypeId: 3,
                        status: 0
                    },
                    vipStatus: 0,
                    battery: 0,
                    chartInfo: {
                        intervalMaxPower: 0,
                        loadBalancePowerLimit: 0,
                        connectorDefaultMaxPower: 0,
                        powerGap: 100
                    }
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
                5: ic_dc_iec,
                6: ic_dc_tesla,
                7: ic_dc_chademo,
                8: ic_dc_ccs2,
                9: ic_dc_ccs1,
                10: ic_dc_gbt
            }
        }
    },
    methods: {
        getSliderMarks(min, max, step, unit) {
            let mark = {},
                lastValue = 0;
            for(let i = min; i <= max ; i += step) {
                if (i < max) {
                    mark[i] = i + "";
                } else if (i == max) {
                    mark[i] = i + " " + unit;
                }
                lastValue = i;
            }
            if (lastValue !== max) {
                mark[max] = max + " " + unit;
            }
            return mark;
        },
    }
}
</script>