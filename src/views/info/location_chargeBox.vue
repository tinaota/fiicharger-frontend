<template>
    <div class="mainctrl">
        <div id="map-container" class="google-map" v-loading="chargeBoxData.isLoading"></div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.location') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="loc-filter">
            <el-select
                class="select-small"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="handleOperatorChanged()">
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <el-select
                class="select-small"
                v-model="filter.chargeBoxId"
                v-loading="chargerBoxList.isLoading"
                :placeholder="$t('menu.chargePoint')"
                @change="updateData()"
                filterable
                clearable
                style="width: 200px">
                <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
            </el-select>
        </div>
        <div class="hint-bar">
            <div class="item">
                <img :src="icon.normal">
                <span class="num" v-if="statisticsInfo.availableCount !== 0" @click="goChargePointPage(1)">{{statisticsInfo.availableCount}}</span>
                <span class="text">{{$t('general.available')}}</span>
            </div>
            <div class="item">
                <img :src="icon.serviceUnavailable">
                <span class="num" v-if="statisticsInfo.unavailableCount !== 0" @click="goChargePointPage(2)">{{statisticsInfo.unavailableCount}}</span>
                <span class="text">{{$t('general.unavailable')}}</span>
            </div>
            <!-- <div class="item">
                <img :src="icon.maintenance">
                <span class="num" v-if="statisticsInfo.maintenanceCount !== 0" @click="goChargePointPage(3)">{{statisticsInfo.maintenanceCount}}</span>
                <span class="text">{{$t('general.maintenance')}}</span>
            </div> -->
            <div class="item">
                <img :src="icon.abnormal">
                <span class="num" v-if="statisticsInfo.alertCount !== 0" @click="goChargePointPage(4)">{{statisticsInfo.alertCount}}</span>
                <span class="text">{{$t('general.alert')}}</span>
            </div>
            <div class="item">
                <img :src="icon.connectionLost">
                <span class="num" v-if="statisticsInfo.connectionLostCount !== 0" @click="goChargePointPage(5)">{{statisticsInfo.connectionLostCount}}</span>
                <span class="text">{{$t('general.connectionLost')}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_getChargeBoxListForSelect, $HTTP_getChargeBoxListForMap, $HTTP_getChargeBoxInfoForMap } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import ic_info_green from 'imgs/ic_info_green.png';
import ic_info_brown from 'imgs/ic_info_brown.png';
import ic_info_red from 'imgs/ic_info_red.png';
import ic_info_gray from 'imgs/ic_info_gray.png';
import ic_info_orange from 'imgs/ic_info_orange.png';
import ic_device_info from 'imgs/ic_device_info.png';
import ic_charging from 'imgs/ic_charging.png';
import ic_revenue from 'imgs/ic_revenue.png';

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
import MarkerClusterer from '@googlemaps/markerclustererplus';
import 'snazzy-info-window/dist/snazzy-info-window.min.css';
import "@/styles/map.scss";
import SnazzyInfoWindow from 'snazzy-info-window';

import markerPos1 from 'imgs/ic_green_dot.png';
import markerPos2 from 'imgs/ic_orange_dot.png';
import markerPos3 from 'imgs/ic_brown_dot.png';
import markerPos4 from 'imgs/ic_red_dot.png';
import markerPos5 from 'imgs/ic_gray_dot.png';
import googleMapStyle from '@/assets/js/googleMapStyle_normal';
import $ from 'jquery'
export default {
    data() {
        return {
            lang: '',
            operatorList: {},
            center: {
                lat: 0,
                lng: 0
            },
            defaultZoomSize: 16,
            minZoomSize: 2,
            maxZoomSize: 22,
            icon: {
                normal: ic_info_green,
                abnormal: ic_info_red,
                maintenance: ic_info_brown,
                connectionLost: ic_info_gray,
                serviceUnavailable: ic_info_orange,
                deviceInfo: ic_device_info,
                charging: ic_charging,
                revenue: ic_revenue,
            },
            filter: {
                operatorTypeId: '',
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
            map: null,
            markers: [],
            clusterMarkers: null,
            clusterStyles: [
                MarkerClusterer.withDefaultStyle({
                    width: 48,
                    height: 48,
                    url: require("imgs/ic_group1.png"),
                    textColor: "#ffffff",
                    textSize: 16
                }),
                MarkerClusterer.withDefaultStyle({
                    width: 48,
                    height: 48,
                    url: require("imgs/ic_group2.png"),
                    textColor: "#ffffff",
                    textSize: 16
                }),
                MarkerClusterer.withDefaultStyle({
                    width: 48,
                    height: 48,
                    url: require("imgs/ic_group3.png"),
                    textColor: "#ffffff",
                    textSize: 16
                })
            ],
            currentInfoWindow: null,
            connectorIcon: {
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
            },
            timer: null,
            markerImgList: [markerPos1, markerPos2, markerPos3, markerPos4, markerPos5]
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        const that = this;
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50vw + 104px -  ${halfHintBarWidth}px)`);
        this.initMap();
        this.fetchData();
        this.setTimer();
        this.fetchChargerBoxList();
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.removeAllMarkers();
    },
    methods: {
        fetchData(isRefresh) {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.chargeBoxId) {
                param.chargeBoxId = this.filter.chargeBoxId;
            }
            this.removeAllMarkers();
            this.chargeBoxData.data = {};
            this.chargeBoxData.isLoading = true;
            $HTTP_getChargeBoxListForMap(param).then((data) => {
                that.chargeBoxData.isLoading = false;
                if (!!data.success) {
                    this.statisticsInfo = Object.assign({}, data.chargeBoxStatusStatisticsInfo);
                    let maxLat = -90, maxLng = -180, minLat = 90, minLng = 180;
                    data.chargeBoxList.forEach(item => {
                        item.loc = {
                            lng: item.lon,
                            lat: item.lat
                        }
                        that.chargeBoxData.data[item.chargeBoxId] = Object.assign({}, item);
                        that.drawMarker(that.chargeBoxData.data[item.chargeBoxId]);

                        if (item.lon > maxLng) {
                            maxLng = item.lon;
                        } else if (item.lon < minLng) {
                            minLng = item.lon;
                        }
                        if (item.lat > maxLat) {
                            maxLat = item.lat;
                        } else if (item.lat < minLat) {
                            minLat = item.lat;
                        }
                    });
                    if (!that.filter.chargeBoxId) {
                        this.drawClusters();
                    }
                    if (!isRefresh) {
                        if (that.filter.chargeBoxId) {
                            that.map.setCenter(that.chargeBoxData.data[that.filter.chargeBoxId].loc);
                            that.map.setZoom(that.defaultZoomSize);
                        } else if (data.chargeBoxList.length === 1) {
                            that.map.setCenter(that.chargeBoxData.data[data.chargeBoxList[0].chargeBoxId].loc);
                            that.map.setZoom(that.defaultZoomSize);
                        } else {
                            const nePoint = new google.maps.LatLng(maxLat, maxLng),
                                  swPoint = new google.maps.LatLng(minLat, minLng),
                                  bounds = new google.maps.LatLngBounds(swPoint, nePoint);
                            that.map.fitBounds(bounds);
                        }
                    }
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchChargerBoxList(callBack) {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId) {
                param.operatorTypeId = (this.filter.operatorTypeId === 1)? '': this.filter.operatorTypeId;
            }
            this.chargerBoxList.isLoading = true;
            $HTTP_getChargeBoxListForSelect(param).then((data) => {
                this.chargerBoxList.isLoading = false;
                this.chargerBoxList.data = {};
                if (!!data.success) {
                    data.chargeBoxList.forEach(item => {
                        this.chargerBoxList.data[item.chargeBoxId] = item.chargeBoxName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                console.log('chargeBoxList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        initMap() {
            this.map = new google.maps.Map(document.getElementById('map-container'), {
                                center: this.center,
                                zoom: this.minZoomSize,
                                minZoom: this.minZoomSize,
                                maxZoom: this.maxZoomSize,
                                streetViewControl: false, //設定是否呈現右下角街景小人
                                mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                                fullscreenControl: false,
                                zoomControl: false,
                                styles: googleMapStyle
                            });
        },
        drawMarker(item) {
            const that = this;
            var markerImage = new google.maps.MarkerImage(this.markerImgList[ item.chargeBoxStatus-1 ],
                                new google.maps.Size(36, 55)); //size  預設位子圖案中間底
            const marker = new google.maps.Marker({
                map: that.map,
                position: item.loc,
                icon: markerImage,
                type: item.chargeBoxStatus
            });

            marker.addListener("click", () => {
                that.chargeBoxData.isLoading = true;
                that.getChargePointInfoHtml(item.chargeBoxId, (htmlContent) => {
                    that.chargeBoxData.isLoading = false;
                    that.$jQuery(".si-content .info-msg").length > 0 && that.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
                    this.currentInfoWindow && that.currentInfoWindow.close();
                    that.currentInfoWindow = null;
                    var infowindow = new SnazzyInfoWindow($.extend({}, {
                                        marker: marker,
                                        placement: 'right',
                                        content: htmlContent,
                                        panOnOpen: false,
                                        borderRadius: '4px',
                                        maxHeight: 'px',
                                        offset: {
                                            top: '-36px',
                                            left: '22px'
                                        },
                                        callbacks: {
                                            afterOpen: function() {
                                                setScrollBar('.si-content .info-msg', that);
                                            }
                                        }
                                    }));
                    infowindow.open();
                    that.currentInfoWindow = infowindow;
                });
            });
            that.markers.push(marker);
        },
        removeAllMarkers() {
            this.$jQuery(".si-content .info-msg").length > 0 && this.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
            this.currentInfoWindow && this.currentInfoWindow.close();
            this.currentInfoWindow = null;
            this.clusterMarkers && this.clusterMarkers.clearMarkers();
            this.markers.forEach(marker => {
                google.maps.event.clearInstanceListeners(marker);
                marker.setMap(null);
            });
            this.markers = [];
        },
        getChargePointInfoHtml(chargeBoxId, callBack) {
            const that = this;
            $HTTP_getChargeBoxInfoForMap({ chargeBoxId: chargeBoxId }).then((data) => {
                if (data.success) {
                    const info = that.getPosInfoHtml(data.chargeBoxInfo)
                    return callBack(info);
                } else {
                    callBack('');
                    return that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('getChargePointInfoHtml', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        getPosInfoHtml: function(item) {
            const currency = $GLOBAL_CURRENCY[item.unitType || 1],
                  connectorHtml = this.getConnectorHtml(item.connectorList);
            let info = `<div class="info-tite">${item.chargeBoxName}</div>
                        <div class="info-msg">
                            <ul>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.deviceInfo}'>${i18n.t('chargingStation.chargePointID')}</div>
                                    <div class="item-msg">${item.chargeBoxId}</div>
                                </li>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.charging}'>${i18n.t('chargingStation.power')}</div>
                                    <div class="item-msg">${item.power}kW</div>

                                    <div class="item-title">${i18n.t('chargingStation.connector')}</div>
                                    <div class="item-msg">${connectorHtml}</div>

                                    <div class="item-title">${i18n.t('chargingStation.elecRate')}</div>
                                    <div class="item-msg">${i18n.t('chargingStation.onPeak') + ' ' + currency + item.onPeakElectricityRate + '/' + i18n.t('chargingStation.elecRateUnit')[item.onPeakElectricityRateType || 1]}</div>
                                    <div class="item-msg">${i18n.t('chargingStation.offPeak') + ' ' + currency + item.offPeakElectricityRate + '/' + i18n.t('chargingStation.elecRateUnit')[item.offPeakElectricityRateType || 1]}</div>

                                    <div class="item-title">${i18n.t('chargingStation.parkingRate')}</div>
                                    <div class="item-msg">${currency + item.parkingRate + '/' + i18n.t('chargingStation.parkingRateUnit')[item.parkingRateType]} </div>
                                </li>
                            </ul>
                        </div>`;
            return info;
        },
        getConnectorHtml(connectorList) {
            let info = '';
            connectorList.forEach((item, idx) => {
                info += '<div class="connector-obj">';
                switch(item.status) {
                    case 1:
                        info += `<span class="circle-number color1">${item.connectorId}</span>`;
                        break;
                    case 2:
                        info += `<span class="circle-number color2">${item.connectorId}</span>`;
                        break;
                    case 4:
                        info += `<span class="circle-number color2">${item.connectorId}</span>`;
                        break;
                    case 5:
                        info += `<span class="circle-number color5">${item.connectorId}</span>`;
                        break;
                    case 6:
                        info += `<span class="circle-number color4">${item.connectorId}</span>`;
                        break;
                    case 3:
                        info += `<span class="circular">
                                    <div class="color6"></div>
                                    <div class="number">${item.connectorId}</div>
                                </span>`;
                        break;
                    default:
                        info += `<span class="circle-number color0">${item.connectorId}</span>`;
                }
                if (item.connectorTypeId !== '1' && item.connectorTypeId !== '5' && item.connectorTypeId !== '4' && item.connectorTypeId !== '10') {
                    info +=`<div class="imgItem"><img src="${this.connectorIcon[item.connectorTypeId]}"></div>
                        </div>`;
                } else {
                    info +=`<div class="imgItem">
                        <span style="vertical-align: sub; margin-left: 4px;">${ item.connectorType }</span>
                    </div></div>`;
                }
            });
            return info;
        },
        handleOperatorChanged() {
            const that = this;
            this.$jQuery(".si-content .info-msg").length > 0 && this.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
            this.currentInfoWindow && this.currentInfoWindow.close();
            this.currentInfoWindow = null;
            this.fetchChargerBoxList(()=> {
                that.updateData();
            });
        },
        updateData() {
            this.fetchData();
            clearInterval(this.timer);
            this.setTimer();

        },
        setTimer() {
            const that = this;
            this.timer = setInterval(() => {
                that.fetchData(true);
            }, 1000 * 60);
        },
        drawClusters() {
            const clusterOpt = {
                                maxZoom: 16, //17開始小點
                                gridSize: 50,
                                styles: this.clusterStyles,
                            };
            this.clusterMarkers = new MarkerClusterer(this.map, this.markers, clusterOpt);
            this.clusterMarkers.setCalculator(function(markers, numStyles) {
                let hasAlert = false;
                markers.forEach(marker => {
                    if (marker.type === 4 ) {
                        hasAlert = true;
                    }
                });
                return {
                    text: markers.length,
                    index: hasAlert ? 3:0
                }
            });
        },
        goChargePointPage(chargeBoxStatus) {
            const params = {
                chargeBoxStatus: chargeBoxStatus,
                operatorTypeId: this.filter.operatorTypeId
            }
            this.$router.push({ name: 'menu.chargePoint', params: params});
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl {
        /* padding: 2.4vh 1.6vw 2.4vh 1.6vw; */
    .el-breadcrumb {
        display: block;
        position: absolute;
        top: calc(68px + 2.4vh);
        left: calc(208px + 1.6vw);
    }
    .loc-filter {
        position: absolute;
        top: calc(68px + 2.4vh + 27px);
        left: calc(208px + 1.6vw);
    }
}
.google-map {
    width: calc(100vw - 208px);
    height: calc(100vh - 68px);
    background: #a1c1fb;
    border-top-left-radius: 20px;
    z-index: 0;
    margin-top: -2.4vh;
    margin-left: -1.6vw;
}
.hint-bar {
    position: absolute;
    /* bottom: calc(2.4vh + 2vh); */
    bottom: 2vh;
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
                font-size: 1rem;
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
                cursor: pointer;
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
</style>