<template>
    <div class="connector-obj">
        <el-tooltip :content="$t('chargingStation.connectorList')[dataObj.status]" placement="bottom" effect="light" popper-class="item custom">
            <span v-if="dataObj.status===1" class="circle-number color1">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===2" class="circle-number color6">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===3" class="circle-number color2">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===4" class="circle-number color2">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===5" class="circle-number color5">{{ dataObj.id }}</span>
            <span v-else-if="dataObj.status===6" class="circle-number color4">{{ dataObj.id }}</span>
        </el-tooltip>
        <span v-if="dataObj.status===0" class="circle-number color0">{{ dataObj.id }}</span>
        <el-tooltip :content="dataObj.typeName" placement="bottom" effect="light" popper-class="custom">
            <div class="imgItem"><img :src="imgIcon[dataObj.type]"></div>
        </el-tooltip>
    </div>
</template>

<script>
export default {
    props: {
        dataObj: {
            type: Object,
            default: function() {
                return {
                    id: '',
                    status: 0,
                    type: 1,
                    typeName: ''
                };
            }
        }
    },
    data() {
        return {
            imgIcon: ['', require("imgs/ic_ac_sae.png"), require("imgs/ic_ac_ccs1.png"), require("imgs/ic_ac_chademo.png")]
        }
    },
}
</script>
<style lang = "scss" scoped>
div.connector-obj {
    display: inline-block;
    .imgItem {
        display: inline-block;
        vertical-align: top;
    }
    + div.connector-obj {
        margin-left: 8px;
    }
    .color6 {
        
    }

}
</style>