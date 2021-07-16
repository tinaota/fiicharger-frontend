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
<style lang = "scss" scoped>
div.connector-obj {
    .imgItem {
        display: inline-block;
        vertical-align: top;
    }
    .circle-number {
        display: inline-block;
        width: 16px;
        height: 16px;
        color: #FFF;
        border-radius: 16px;
        line-height: 16px;
        text-align: center;
        padding: 4px;
        vertical-align: text-top;
    }
    .color0 {
        background: transparent;
        border: 1px solid #525E69;
        color: #525E69;
        &.circle-number {
            padding: 3px;
        }
    }
    .color1 {
        background: #33c85a;
    }
    .color2 {
        background: #ffa10b;
    }
    .color3 {
        background: #5e3715;
    }
    .color4 {
        background: #fc2e56;
    }
    .color5 {
        background: #8c8f97;
    }
    .color6 {
        background: #1e5eff;
    }
    .circular {
        display: inline-block;
        height:24px;
        width: 24px;
        position: relative;
        margin-top: 2px;
        .number {
            position: absolute;
            top: 1px;
            left: 8px;
        }
        .color6 {
            position: absolute;
            height: 24px;
            width: 24px;
            background-color: #0885ff;
            border: 2px solid #0885ff;
            border-radius: 50%;
            border-top: 2px solid #e7f3fd;
            border-bottom: 2px solid #e7f3fd;
            -webkit-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
        }
        @-webkit-keyframes spin {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    }
}
div.connector-obj:not(.nextLine) {
    display: inline-block;
    + div.connector-obj {
        margin-left: 8px;
    }
}
div.connector-obj.nextLine {
    display: block;
    margin-top: 4px;
}
</style>