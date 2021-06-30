<template>
    <div class="connector-obj" 
        v-bind:class="{ 'nextLine': isBreak }">
        <el-tooltip :content="$t('chargingStation.connectorList')[dataObj.status]" placement="bottom" effect="light" popper-class="item custom">
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
                    connectorTypeId: 1,
                    connectorType: ''
                };
            }
        }
    },
    data() {
        return {
            imgIcon: {
                3: require("imgs/ic_ac_sae.png"),
                9: require("imgs/ic_ac_ccs1.png"),
                7:require("imgs/ic_ac_chademo.png")
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
    /* .color6 {
        position: relative;
        border: 2px solid #0885ff;
        border-radius: 50%;
        border-top: 2px solid #FFF;
        border-bottom: 2px solid #FFF;
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
    } */
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
            /* transform: translate(-50%, -50%); */
        }
        .color6 {
            position: absolute;
            height: 24px;
            width: 24px;
            background-color: #0885ff;
            border: 2px solid #0885ff;
            border-radius: 50%;
            border-top: 2px solid #c2e0fc;
            border-bottom: 2px solid #c2e0fc;
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