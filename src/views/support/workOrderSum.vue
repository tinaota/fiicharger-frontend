<template>
    <div class="scroll">
        <div class="mainctrl">
            <div id="mapboxBox" v-loading="chargeBoxData.isLoading" />
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.support') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.workOrder') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.summary') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('menu.summary')" name="summary">
                </el-tab-pane>
                <el-tab-pane :label="$t('menu.history')" name="history">
                </el-tab-pane>
            </el-tabs>
            <div class="loc-filter">
                <div class="label">{{ $t('general.operator') }}</div>
                <el-select
                    class="select-small"
                    v-model="filter.operatorTypeId"
                    @change="handleOperatorChanged()">
                    <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                </el-select>
                <div class="label">{{ $t('menu.chargePoint') }}</div>
                <el-select
                    class="select-small"
                    v-model="filter.chargeBoxId"
                    v-loading="chargerBoxList.isLoading"
                    @change="fetchData()"
                    filterable
                    style="width: 200px">
                    <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
                </el-select>
            </div>
            <div class="hint-bar">
                <div class="item">
                    <img :src="icon.normal">
                    <span class="num" v-if="statisticsInfo.availableCount !== 0">{{statisticsInfo.availableCount}}</span>
                    <span class="text">{{$t('general.available')}}</span>
                </div>
                <div class="item">
                    <img :src="icon.serviceUnavailable">
                    <span class="num" v-if="statisticsInfo.unavailableCount !== 0">{{statisticsInfo.unavailableCount}}</span>
                    <span class="text">{{$t('general.unavailable')}}</span>
                </div>
                <div class="item">
                    <img :src="icon.maintenance">
                    <span class="num" v-if="statisticsInfo.maintenanceCount !== 0">{{statisticsInfo.maintenanceCount}}</span>
                    <span class="text">{{$t('general.maintenance')}}</span>
                </div>
                <div class="item">
                    <img :src="icon.abnormal">
                    <span class="num" v-if="statisticsInfo.alertCount !== 0">{{statisticsInfo.alertCount}}</span>
                    <span class="text">{{$t('general.alert')}}</span>
                </div>
                <div class="item">
                    <img :src="icon.connectionLost">
                    <span class="num" v-if="statisticsInfo.connectionLostCount !== 0">{{statisticsInfo.connectionLostCount}}</span>
                    <span class="text">{{$t('general.connectionLost')}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            lang: '',
            active: 'summary',
            operatorList: {
                1: i18n.t('general.all'),
                2: "MidwestFiber",
                3: "APT"
            },
            center: {
                lat: 67.87946334072687,
                lng: 173.85862513198617
            },
            defaultZoomSize: 16,
            minZoomSize: 1.5,
            maxZoomSize: 22,
            icon: {
                normal: require("imgs/ic_info_green.png"),
                abnormal: require("imgs/ic_info_red.png"),
                maintenance: require("imgs/ic_info_brown.png"),
                connectionLost: require("imgs/ic_info_gray.png"),
                serviceUnavailable: require("imgs/ic_info_orange.png"),
                deviceInfo: require("imgs/ic_device_info.png"),
                charging: require("imgs/ic_charging.png"),
                revenue: require("imgs/ic_revenue.png")
            },
            filter: {
                operatorTypeId: 1,
                chargeBoxId: ''
            },
            chargerBoxList: {
                isLoading: false,
                data: {},
                zoomSize: 16
            },
            chargeBoxData: {
                isLoading: false,
                data: []
            },
            statisticsInfo: {
                availableCount: 0,
                unavailableCount: 0,
                maintenanceCount: 0,
                alertCount: 0,
                connectionLostCount: 0
            },
        }
    },
    mounted() {
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50% -  ${halfHintBarWidth}px)`);
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            setScrollBar('.scroll', this);
        },
        changePage(page) {
        },
        handleTabClick(tab, event) {
            if (this.active === 'history') {
                this.$router.push({ path: "/workOrder/history" }).catch();
            }
        },
        handleOperatorChanged() {}
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl {
    position: relative;
    width: 100%;
    height: calc(100vh - 68px);
    padding: 0;
    #mapboxBox {
        position: absolute;
        width: calc(100vw - 208px);
        height: calc(100vh - 68px);
        background: #a1c1fb;
        top: 0;
        left: 0;
        z-index: 0;
    }
    .el-breadcrumb {
        display: block;
        position: absolute;
        top: 2.4vh;
        left: 1.6vw;
    }
    .el-tabs {
        position: absolute;
        top: 7.6vh;
        left: 2.8vw;
        width: calc(100% - 5.6vw);
    }
    .loc-filter {
        position: absolute;
        top: calc(7.6vh + 55px);
        left: 2.8vw;
        width: calc(100% - 5.6vw);
    }
    .hint-bar {
        position: absolute;
        bottom: calc(2.5vh);
        width: auto;
        height: auto;
        padding: 10px 18px;
        background-color: #E6EEF8;
        box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10);
        border-radius: 30px;
        vertical-align: middle;
        .item {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            height: 24px;
            span {
                letter-spacing: 0;
                color: #151E25;
                &.text {
                    height: 24px;
                    line-height: 24px;
                    /* vertical-align: bottom; */
                    vertical-align: top;
                    margin-left: 10px;
                    font-size: 1.125rem;
                }
                &.num {
                    position: absolute;
                    /* bottom: 18px; */
                    top: 18px;
                    left: 16px;
                    /* background-color: #F84736;
                    color: #FFF; */
                    background-color: rgb(240, 201, 197);
                    padding: 2px 4px;
                    border-radius: 16px;
                    font-size: 0.875rem;
                }
            }
            img {
                width: 24px;
            }
            + .item {
                margin-left: 24px;
            }
        }
    }
}
</style>