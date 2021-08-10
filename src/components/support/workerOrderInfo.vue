<template>
    <div class="worker-order-item">
        <div class="main-info">
            <div class="item">
                <div class="label">{{ $t('support.workerOrderId') }}</div>
                <div class="content">
                    {{ dataObj.workOrderCode }}
                    <el-button class="no-bg loc" @click="setCenter"></el-button>
                </div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                <div class="content">{{ dataObj.chargeBoxId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('support.alertName') }}</div>
                <div class="content">{{ dataObj.alertName }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('support.lastUpdateTime') }}</div>
                <div class="content">{{ dataObj.lastUpdateTime }}</div>
            </div>
        </div>
        <div class="detail">
            <div class="header">
                {{ $t('general.details') }}
                <el-button v-if="!isOpen" icon="el-icon-arrow-down" class="no-bg" @click="handleCollapse(true)"></el-button>
                <el-button v-else icon="el-icon-arrow-up" class="no-bg" @click="handleCollapse(false)"></el-button>
            </div>
            <div :class="{'content':true, 'open': isOpen}" v-show="isOpen">
                <el-timeline>
                    <el-timeline-item
                        v-for="(item, index) in dataObj.detail"
                        :key="index">
                        <span>{{ item.time }}</span><br/>
                        <span>{{ item.msg }}</span>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        dataObj: {
            type: Object,
            default: function() {
                return {
                    workOrderCode: '',
                    chargeBoxId: '',
                    alertName: '',
                    lastUpdateTime: ''
                };
            }
        },
        curWorkOrder: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isOpen: false
        }
    },
    methods: {
        setCenter() {
            this.$emit('setCenter', JSON.stringify(this.dataObj.loc));
        },
        handleCollapse(isOpen) {
            // this.$jQuery(".el-timeline").length > 0 && this.$jQuery(".el-timeline").mCustomScrollbar('destroy');
            this.isOpen = isOpen;
            // setScrollBar(".el-timeline", this);
        },
    }
}
</script>
<style lang = "scss" scoped>
.worker-order-item {
    box-sizing: border-box;
    padding-top: 8px;
    margin-right: 8px;
    + .worker-order-item {
        border-top: 1px solid #BCBCBC;
    }
    .main-info {
        font-size: 0.875rem;
        .item {
            margin-bottom: 6px;
            .label {
                display: inline-block;
                width: calc(50% - 13px);
                color: #525E69;
                vertical-align: top;
                padding-right: 8px;
            }
            .content {
                position: relative;
                display: inline-block;
                width: 50%;
                color: #151E25;
                vertical-align: top;
                word-break: break-word;
                .el-button {
                    position: absolute;
                    right: 0;
                    top: -4px;
                }
            }
        }
    }
    .detail {
        .header {
            font-size: 1rem;
            color: #151E25;
            letter-spacing: 0;
            margin-top: 20px;
            margin-bottom: 8px;
        }
        .content {
            padding-right: 12px;
        }
    }
}
</style>